import { act } from "@testing-library/react";
import { RealtimeClient, type RealtimeClientOptions } from "../shared/realtime/client";
import type {
  ClientMessageType,
  ClientPayloadOf,
  EventData,
  ServerEventName,
} from "../shared/realtime/protocol";

type SentRequest = { type: ClientMessageType; payload: unknown; requestId?: string };
type RequestHandler = (request: SentRequest) => unknown | Promise<unknown>;

/**
 * The real `RealtimeClient` with the socket cut out: `connect` just reports "open",
 * and events are fed straight into the client's own message handling, so
 * subscribers registered through `useRealtime().subscribe` see them as if the
 * server had sent them.
 */
export class MockRealtimeClient extends RealtimeClient {
  readonly requests: SentRequest[] = [];
  requestHandler: RequestHandler = () => undefined;

  connect(): void {
    this.setStatus("open");
  }

  disconnect(): void {
    this.setStatus("closed");
  }

  request<T extends ClientMessageType, D = unknown>(
    type: T,
    payload: ClientPayloadOf<T>,
    requestId?: string
  ): Promise<D> {
    const sent = { type, payload, requestId };
    this.requests.push(sent);
    return Promise.resolve().then(() => this.requestHandler(sent) as D);
  }

  emit<K extends ServerEventName>(event: K, data: EventData<K>): void {
    this.handleMessage(JSON.stringify({ type: "event", event, data }));
  }

  /** Reports the connection as open, even when the provider has no token or route for it. */
  open(): void {
    this.setStatus("open");
  }
}

/**
 * Pass `createClient` to `RealtimeProvider` (or render inside `RealtimeTestProviders`),
 * then `emit("bill.paid", {...})` from the test.
 */
export const createMockRealtime = () => {
  let client: MockRealtimeClient | null = null;

  const current = () => {
    if (!client) {
      throw new Error("mockRealtime: render a RealtimeProvider with `createClient` first");
    }
    return client;
  };

  return {
    /** The client the provider is using, for calling `request` directly. */
    client: current,
    createClient: (options: RealtimeClientOptions) => {
      client = new MockRealtimeClient(options);
      return client;
    },
    /** Delivers a server event to every subscriber, inside `act` so React state settles. */
    emit: <K extends ServerEventName>(event: K, data: EventData<K>) => act(() => current().emit(event, data)),
    /** Marks the connection open, so `status === "open"` checks pass. */
    open: () => act(() => current().open()),
    /** Requests the code under test sent (`order.create`, ...), oldest first. */
    requests: () => current().requests,
    /** Decides what a request resolves (or rejects) with. Resolves `undefined` by default. */
    onRequest: (handler: RequestHandler) => {
      current().requestHandler = handler;
    },
  };
};

export type MockRealtimeControls = ReturnType<typeof createMockRealtime>;
