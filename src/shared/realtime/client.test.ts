import { describe, expect, it, vi } from "vitest";
import { RealtimeClient } from "./client";
import type { CloseAction } from "./protocol";

class FakeSocket {
  static instances: FakeSocket[] = [];
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(public url: string) {
    FakeSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.onclose?.({ code: 1000, reason: "client disconnect" });
  }

  open() {
    this.onopen?.();
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const connectClient = async (onClose?: (code: number, reason: string, action: CloseAction) => void) => {
  const tickets: string[] = [];
  FakeSocket.instances = [];
  const client = new RealtimeClient({
    wsBaseUrl: "ws://localhost:8080/ws",
    getTicket: async () => {
      const ticket = `ticket-${tickets.length + 1}`;
      tickets.push(ticket);
      return ticket;
    },
    socketFactory: (url) => new FakeSocket(url) as unknown as WebSocket,
    reconnectDelayMs: () => 0,
    abuseDelayMs: 0,
    onClose,
  });
  client.connect();
  await vi.waitFor(() => expect(FakeSocket.instances.length).toBeGreaterThan(0));
  const socket = FakeSocket.instances[0];
  socket.open();
  return { client, tickets, socket };
};

describe("protocol client", () => {
  it("connects with a fresh ticket and resolves a typed ack", async () => {
    const { client, tickets, socket } = await connectClient();
    expect(socket.url).toContain("v=2");
    expect(socket.url).toContain("ticket=ticket-1");
    expect(socket.url).not.toContain("token=");
    expect(tickets).toEqual(["ticket-1"]);

    const pending = client.request("order.create", { clientOrderId: "abc", items: [] }, "req-1");
    socket.onmessage?.({
      data: JSON.stringify({
        type: "ack",
        requestId: "req-1",
        ok: true,
        data: { order: { _id: "order-1", rev: 1 } },
      }),
    });
    await expect(pending).resolves.toEqual({ order: { _id: "order-1", rev: 1 } });
    client.disconnect();
  });

  it("rejects a failed ack and retries RATE_LIMITED once", async () => {
    const { client, socket } = await connectClient();
    const pending = client.request("order.cancel", { orderId: "order-1", reason: "no" }, "req-2");
    socket.onmessage?.({
      data: JSON.stringify({
        type: "ack",
        requestId: "req-2",
        ok: false,
        error: { code: "RATE_LIMITED", message: "Too many messages", details: { retryAfterMs: 0 } },
      }),
    });
    await vi.waitFor(() => expect(socket.sent).toHaveLength(2));
    socket.onmessage?.({
      data: JSON.stringify({
        type: "ack",
        requestId: "req-2",
        ok: false,
        error: { code: "FORBIDDEN", message: "nope" },
      }),
    });
    await expect(pending).rejects.toMatchObject({ code: "FORBIDDEN" });
    client.disconnect();
  });

  it("fetches a new ticket on reconnect and stops for fatal close codes", async () => {
    const actions: CloseAction[] = [];
    const first = await connectClient((_code, _reason, action) => actions.push(action));
    const { tickets, socket } = first;

    socket.onclose?.({ code: 1006, reason: "" });
    await vi.waitFor(() => expect(tickets.length).toBe(2));
    expect(FakeSocket.instances[FakeSocket.instances.length - 1]?.url).toContain("ticket=ticket-2");
    expect(actions).toContain("reconnectBackoff");
    first.client.disconnect();

    const fatal = await connectClient((_code, _reason, action) => actions.push(action));
    fatal.socket.onclose?.({ code: 4004, reason: "session closed" });
    await flush();
    expect(actions).toContain("guestThankYou");
    expect(fatal.tickets).toEqual(["ticket-1"]);
    fatal.client.disconnect();

    const expired = await connectClient();
    expired.socket.onclose?.({ code: 4001, reason: "expired" });
    await flush();
    expect(expired.tickets).toEqual(["ticket-1"]);
    expired.client.disconnect();

    const forbidden = await connectClient((_code, _reason, action) => actions.push(action));
    forbidden.socket.onclose?.({ code: 4003, reason: "forbidden" });
    await flush();
    expect(actions).toContain("logout");
    forbidden.client.disconnect();

    const oldClient = await connectClient((_code, _reason, action) => actions.push(action));
    oldClient.socket.onclose?.({ code: 4000, reason: "unsupported protocol version" });
    await flush();
    expect(actions).toContain("reload");
    oldClient.client.disconnect();

    const shutdown = await connectClient((_code, _reason, action) => actions.push(action));
    shutdown.socket.onclose?.({ code: 1001, reason: "shutdown" });
    await vi.waitFor(() => expect(shutdown.tickets.length).toBe(2));
    expect(actions).toContain("reconnectBackoff");
    shutdown.client.disconnect();

    const abuse = await connectClient((_code, _reason, action) => actions.push(action));
    abuse.socket.onclose?.({ code: 4008, reason: "abuse" });
    await vi.waitFor(() => expect(abuse.tickets.length).toBe(2));
    expect(actions).toContain("waitThenReconnect");
    abuse.client.disconnect();
  });
});
