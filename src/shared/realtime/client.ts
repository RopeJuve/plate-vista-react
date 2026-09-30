import {
  CLOSE_CODE_ACTIONS,
  PROTOCOL_VERSION,
  ProtocolError,
  type AckMessage,
  type ClientMessageType,
  type ClientPayloadOf,
  type CloseAction,
  type InboundMessage,
  type OutboundMessage,
  type RealtimeStatus,
  type EventData,
  type ServerEventName,
} from "./protocol";

const REQUEST_TIMEOUT_MS = 8000;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;
const ABUSE_COOLDOWN_MS = 5000;

type Unsubscribe = () => void;

  type EventHandler<K extends ServerEventName = ServerEventName> = (data: EventData<K>) => void;

type PendingRequest = {
  resolve: (data: unknown) => void;
  reject: (error: ProtocolError) => void;
  timeoutHandle: ReturnType<typeof setTimeout>;
  message: OutboundMessage;
  retriedForRateLimit: boolean;
};

export interface RealtimeClientOptions {
  /** Base WebSocket URL, e.g. wss://plate-vista-api.onrender.com/ws (no query string). */
  wsBaseUrl: string;
  /**
   * Fetches a fresh, short-lived ws ticket via `POST /api/v1/ws-ticket`.
   * Called before every connect and reconnect — a ticket is never reused.
   */
  getTicket: () => Promise<string>;
  /** Called on every close with the raw code/reason and the resolved client action. */
  onClose?: (code: number, reason: string, action: CloseAction) => void;
  /** Called whenever the connection status changes. */
  onStatusChange?: (status: RealtimeStatus) => void;
  /** Test seam. Defaults to the browser `WebSocket`. */
  socketFactory?: (url: string) => WebSocket;
  /** Override reconnect delay. Defaults to capped exponential backoff. */
  reconnectDelayMs?: (attempt: number) => number;
  /** Delay before reconnecting after close code 4008. */
  abuseDelayMs?: number;
}

/**
 * FE-02 — Protocol v2.1 client.
 *
 * Owns the single WebSocket connection for the app. Components never touch
 * this directly — they go through a feature hook, which goes through
 * `useRealtime()` (see `RealtimeProvider.tsx`), which calls into this class.
 */
export class RealtimeClient {
  private socket: WebSocket | null = null;
  private status: RealtimeStatus = "closed";
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectGeneration = 0;
  private manuallyStopped = true;
  private readonly pending = new Map<string, PendingRequest>();
  private readonly eventHandlers = new Map<ServerEventName, Set<EventHandler>>();
  private readonly statusHandlers = new Set<(status: RealtimeStatus) => void>();

  constructor(private readonly options: RealtimeClientOptions) {}

  getStatus(): RealtimeStatus {
    return this.status;
  }

  onStatusChange(handler: (status: RealtimeStatus) => void): Unsubscribe {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  /** Subscribes to a server room event. Returns an unsubscribe function. */
  subscribe<K extends ServerEventName>(event: K, handler: EventHandler<K>): Unsubscribe {
    const set = this.eventHandlers.get(event) ?? new Set<EventHandler>();
    const stored = handler as unknown as EventHandler;
    set.add(stored);
    this.eventHandlers.set(event, set);
    return () => {
      set.delete(stored);
    };
  }

  /** Opens the connection (fetching a fresh ticket first). Safe to call multiple times. */
  connect(): void {
    this.manuallyStopped = false;
    if (this.status === "open" || this.status === "connecting") {
      return;
    }
    void this.doConnect();
  }

  /** Closes the connection and stops all reconnect attempts. */
  disconnect(): void {
    this.manuallyStopped = true;
    this.connectGeneration += 1;
    this.clearReconnectTimer();
    this.rejectAllPending(new ProtocolError("INTERNAL", "Connection closed"));
    this.socket?.close(1000, "client disconnect");
    this.socket = null;
    this.setStatus("closed");
  }

  /**
   * Sends a request and resolves with typed ack data on `ok: true`, rejects
   * with a typed `ProtocolError` on `ok: false`, and rejects with a
   * `ProtocolError("TIMEOUT", ...)` after 8s.
   */
  request<T extends ClientMessageType, D = unknown>(
    type: T,
    payload: ClientPayloadOf<T>,
    requestId: string = crypto.randomUUID()
  ): Promise<D> {
    if (this.status !== "open" || !this.socket) {
      return Promise.reject(new ProtocolError("INTERNAL", "Not connected"));
    }

    const message: OutboundMessage<T> = { type, requestId, payload };

    return new Promise<D>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new ProtocolError("TIMEOUT", "The request timed out"));
      }, REQUEST_TIMEOUT_MS);

      this.pending.set(requestId, {
        resolve: resolve as (data: unknown) => void,
        reject,
        timeoutHandle,
        message,
        retriedForRateLimit: false,
      });

      this.sendRaw(message);
    });
  }

  // -- internals -------------------------------------------------------

  private setStatus(status: RealtimeStatus) {
    if (this.status === status) {
      return;
    }
    this.status = status;
    this.options.onStatusChange?.(status);
    this.statusHandlers.forEach((handler) => handler(status));
  }

  private sendRaw(message: OutboundMessage) {
    this.socket?.send(JSON.stringify(message));
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private rejectAllPending(error: ProtocolError) {
    this.pending.forEach((entry) => {
      clearTimeout(entry.timeoutHandle);
      entry.reject(error);
    });
    this.pending.clear();
  }

  private async doConnect(): Promise<void> {
    const generation = ++this.connectGeneration;
    this.setStatus(this.reconnectAttempt > 0 ? "reconnecting" : "connecting");

    let ticket: string;
    try {
      ticket = await this.options.getTicket();
    } catch {
      // Ticket fetch failed (e.g. Render cold start, or REST is briefly down).
      // Treat it like any other network hiccup and back off.
      this.scheduleReconnect(generation);
      return;
    }

    if (generation !== this.connectGeneration || this.manuallyStopped) {
      return;
    }

    const base = this.options.wsBaseUrl.replace(/\/$/, "");
    const join = base.includes("?") ? "&" : "?";
    const url = `${base}${join}v=${PROTOCOL_VERSION}&ticket=${encodeURIComponent(ticket)}`;
    const socket = (this.options.socketFactory ?? ((nextUrl) => new WebSocket(nextUrl)))(url);
    this.socket = socket;

    socket.onopen = () => {
      if (generation !== this.connectGeneration) {
        return;
      }
      this.reconnectAttempt = 0;
      this.setStatus("open");
    };

    socket.onmessage = (event) => {
      if (generation !== this.connectGeneration) {
        return;
      }
      this.handleMessage(event.data);
    };

    socket.onclose = (event) => {
      if (generation !== this.connectGeneration) {
        return;
      }
      this.socket = null;
      this.handleClose(event.code, event.reason, generation);
    };

    socket.onerror = () => {
      // onclose always follows onerror for browser WebSockets; nothing to do here.
    };
  }

  private handleMessage(raw: string) {
    let message: InboundMessage;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }

    if (message.type === "ack") {
      this.handleAck(message);
      return;
    }

    if (message.type === "event") {
      const handlers = this.eventHandlers.get(message.event);
      handlers?.forEach((handler) => handler(message.data));
    }
  }

  private handleAck(message: AckMessage) {
    const entry = this.pending.get(message.requestId);
    if (!entry) {
      return;
    }

    if (message.ok === true) {
      clearTimeout(entry.timeoutHandle);
      this.pending.delete(message.requestId);
      entry.resolve(message.data);
      return;
    }

    const error = (message as Extract<AckMessage, { ok: false }>).error;
    const { code } = error;

    if (code === "RATE_LIMITED" && !entry.retriedForRateLimit) {
      clearTimeout(entry.timeoutHandle);
      const retryAfterMs =
        error.details && typeof error.details === "object" && "retryAfterMs" in error.details
          ? Number((error.details as { retryAfterMs: number }).retryAfterMs)
          : 1000;
      entry.retriedForRateLimit = true;
      const timeoutHandle = setTimeout(() => {
        this.pending.delete(message.requestId);
        entry.reject(new ProtocolError("TIMEOUT", "The request timed out"));
      }, REQUEST_TIMEOUT_MS);
      entry.timeoutHandle = timeoutHandle;
      setTimeout(() => {
        if (this.status === "open" && this.pending.has(message.requestId)) {
          this.sendRaw(entry.message);
        }
      }, Math.max(0, retryAfterMs));
      return;
    }

    clearTimeout(entry.timeoutHandle);
    this.pending.delete(message.requestId);
    entry.reject(new ProtocolError(error.code, error.message, error.details));
  }

  private handleClose(code: number, reason: string, generation: number) {
    const action = CLOSE_CODE_ACTIONS[code] ?? "reconnectBackoff";
    this.rejectAllPending(new ProtocolError("INTERNAL", "Connection closed"));
    this.setStatus("closed");
    this.options.onClose?.(code, reason, action);

    if (this.manuallyStopped) {
      return;
    }

    switch (action) {
      case "reload":
      case "logout":
      case "guestThankYou":
        // Fatal — the provider/app decides what to do next (e.g. log out,
        // show a thank-you screen). We do not reconnect.
        this.manuallyStopped = true;
        return;
      case "refreshToken":
        // Stop here. The provider refreshes the access token, then calls
        // connect(), which fetches a brand-new ticket.
        this.manuallyStopped = true;
        return;
      case "waitThenReconnect":
        this.scheduleReconnect(generation, this.options.abuseDelayMs ?? ABUSE_COOLDOWN_MS);
        return;
      case "reconnectBackoff":
      case "none":
      default:
        this.scheduleReconnect(generation);
        return;
    }
  }

  private scheduleReconnect(generation: number, explicitDelayMs?: number) {
    if (generation !== this.connectGeneration || this.manuallyStopped) {
      return;
    }
    this.clearReconnectTimer();
    const delay =
      explicitDelayMs ??
      this.options.reconnectDelayMs?.(this.reconnectAttempt) ??
      Math.min(INITIAL_BACKOFF_MS * 2 ** this.reconnectAttempt, MAX_BACKOFF_MS);
    this.reconnectAttempt += 1;
    this.setStatus("reconnecting");
    this.reconnectTimer = setTimeout(() => {
      void this.doConnect();
    }, delay);
  }
}
