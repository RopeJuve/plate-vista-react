import { describe, expect, it } from "vitest";
import { applyServerEvent, applySnapshot, boardReducer, emptyBoard, listTickets } from "./boardState";
import type { Order, OrderItem, StaffBoard, Ticket } from "../../shared/realtime/protocol";

const order = (rev: number, status: Order["status"] = "pending"): Order => ({
  _id: "order-1",
  restaurantId: "rest-1",
  sessionId: "session-1",
  tableId: "table-1",
  clientOrderId: "client-1",
  status,
  rev,
  tickets: [],
  items: [],
  totalCents: 500,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const line = (title: string, station: OrderItem["station"], lineTotalCents: number): OrderItem => ({
  productId: title,
  title,
  unitPriceCents: lineTotalCents,
  quantity: 1,
  lineTotalCents,
  notes: "",
  station,
});

const ticket = (station: Ticket["station"], status: Ticket["status"], cancelReason = ""): Ticket => ({
  station,
  status,
  cancelReason,
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
  recentlyClosed: [],
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
      data: { orderId: "order-1", status: "accepted", rev: 2, tickets: [], totalCents: 500 },
    });

    expect(state.ordersById["order-1"].rev).toBe(3);
    expect(state.ordersById["order-1"].status).toBe("preparing");

    state = applyServerEvent(state, {
      event: "order.statusChanged",
      data: { orderId: "order-1", status: "ready", rev: 4, tickets: [], totalCents: 500 },
    });
    expect(state.ordersById["order-1"].status).toBe("ready");
    expect(state.ordersById["order-1"].rev).toBe(4);
  });

  it("replays buffered events through the same rev rule after a snapshot", () => {
    const state = boardReducer(
      emptyBoard(),
      {
        type: "hydrate",
        board: board(3, "preparing"),
        events: [
          {
            event: "order.statusChanged",
            data: { orderId: "order-1", status: "accepted", rev: 1, tickets: [], totalCents: 500 },
          },
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

  it("moves a closed session to recently closed with its bill total", () => {
    let state = applySnapshot(board(1, "pending"));
    state = applyServerEvent(state, {
      event: "session.closed",
      data: { sessionId: "session-1", tableId: "table-1" },
    });
    expect(state.recentlyClosed).toHaveLength(1);
    expect(state.recentlyClosed[0]).toMatchObject({
      _id: "session-1",
      tableNumber: 4,
      status: "closed",
      totalCents: 500,
    });
  });
});

describe("tickets on the rail", () => {
  const mixed = (): StaffBoard => {
    const base = board(1, "pending");
    return {
      ...base,
      orders: [
        {
          ...order(1),
          items: [line("Pils", "bar", 800), line("Pizza", "kitchen", 1000)],
          tickets: [ticket("kitchen", "pending"), ticket("bar", "pending")],
          totalCents: 1800,
        },
      ],
    };
  };
  const stations = (state: ReturnType<typeof applySnapshot>, status: Order["status"]) =>
    listTickets(state, [status], "all").map((listed) => listed.ticket.station);

  it("hangs one chit per ticket and filters by station", () => {
    const state = applySnapshot(mixed());
    expect(stations(state, "pending")).toEqual(["kitchen", "bar"]);
    expect(listTickets(state, ["pending"], "bar")).toHaveLength(1);
  });

  it("moves only the ticket that changed", () => {
    const state = applyServerEvent(applySnapshot(mixed()), {
      event: "order.statusChanged",
      data: {
        orderId: "order-1",
        status: "pending",
        rev: 2,
        station: "bar",
        tickets: [ticket("kitchen", "pending"), ticket("bar", "ready")],
        totalCents: 1800,
      },
    });
    expect(stations(state, "pending")).toEqual(["kitchen"]);
    expect(stations(state, "ready")).toEqual(["bar"]);
    expect(state.ordersById["order-1"].status).toBe("pending");
  });

  it("drops a cancelled ticket from the rail and its lines from the total", () => {
    const state = applyServerEvent(applySnapshot(mixed()), {
      event: "order.statusChanged",
      data: {
        orderId: "order-1",
        status: "pending",
        rev: 2,
        station: "kitchen",
        reason: "no dough",
        tickets: [ticket("kitchen", "cancelled", "no dough"), ticket("bar", "pending")],
        totalCents: 800,
      },
    });
    expect(stations(state, "pending")).toEqual(["bar"]);
    expect(state.ordersById["order-1"].totalCents).toBe(800);
  });

  it("treats an order without stored tickets as one ticket per station at the order's status", () => {
    const old = mixed();
    const legacy = { ...old.orders[0], tickets: undefined, status: "accepted" } as unknown as Order;
    const state = applySnapshot({ ...old, orders: [legacy] });
    expect(stations(state, "accepted")).toEqual(["kitchen", "bar"]);
  });
});
