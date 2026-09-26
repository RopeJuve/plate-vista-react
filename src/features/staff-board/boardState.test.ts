import { describe, expect, it } from "vitest";
import { applyServerEvent, applySnapshot, boardReducer } from "./boardState";
import type { Order, StaffBoard } from "../../shared/realtime/protocol";

const order = (rev: number, status: Order["status"] = "pending"): Order => ({
  _id: "order-1",
  restaurantId: "rest-1",
  sessionId: "session-1",
  tableId: "table-1",
  clientOrderId: "client-1",
  status,
  rev,
  items: [],
  totalCents: 500,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const board = (rev: number, status: Order["status"] = "accepted"): StaffBoard => ({
  sessions: [
    {
      _id: "session-1",
      tableId: "table-1",
      tableNumber: 4,
      status: "open",
      openedAt: "2026-01-01T00:00:00.000Z",
      closedAt: null,
    },
  ],
  orders: [order(rev, status)],
  tables: [{ _id: "table-1", tableNumber: 4, capacity: 4, status: "occupied", qrCode: "qr" }],
});

describe("staff board rev rule", () => {
  it("ignores an older rev that arrives after a newer one", () => {
    let state = applySnapshot(board(3, "preparing"));
    state = applyServerEvent(state, {
      event: "order.updated",
      data: { order: order(2, "accepted") },
    });
    state = applyServerEvent(state, {
      event: "order.statusChanged",
      data: { orderId: "order-1", status: "accepted", rev: 2 },
    });

    expect(state.ordersById["order-1"].rev).toBe(3);
    expect(state.ordersById["order-1"].status).toBe("preparing");

    state = applyServerEvent(state, {
      event: "order.statusChanged",
      data: { orderId: "order-1", status: "ready", rev: 4 },
    });
    expect(state.ordersById["order-1"].status).toBe("ready");
    expect(state.ordersById["order-1"].rev).toBe(4);
  });

  it("replays buffered events through the same rev rule after a snapshot", () => {
    const state = boardReducer(
      { ordersById: {}, orderIdsBySession: {}, sessionsById: {}, sessionIdByTable: {}, tablesById: {}, ready: false },
      {
        type: "hydrate",
        board: board(3, "preparing"),
        events: [
          { event: "order.statusChanged", data: { orderId: "order-1", status: "accepted", rev: 1 } },
          { event: "order.updated", data: { order: order(4, "ready") } },
        ],
      }
    );

    expect(state.ordersById["order-1"].rev).toBe(4);
    expect(state.ordersById["order-1"].status).toBe("ready");
  });

  it("removes a session and its orders when the session closes", () => {
    let state = applySnapshot(board(1, "pending"));
    state = applyServerEvent(state, {
      event: "session.closed",
      data: { sessionId: "session-1", tableId: "table-1" },
    });
    expect(state.ordersById["order-1"]).toBeUndefined();
    expect(state.sessionsById["session-1"]).toBeUndefined();
    expect(state.tablesById["table-1"].status).toBe("vacant");
  });
});
