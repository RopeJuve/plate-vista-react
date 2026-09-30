import { describe, expect, it } from "vitest";
import {
  applyServerEvent,
  applySnapshot,
  boardReducer,
  emptyBoard,
  listTickets,
  summariseTables,
  tableCheck,
} from "../boardState";
import type { Order, OrderItem, StaffBoard, Ticket } from "../../../shared/realtime/protocol";

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

  it("tells a ticket of a split order from a ticket that is the whole order", () => {
    const state = applySnapshot(mixed());
    expect(listTickets(state, ["pending"], "all").map((listed) => listed.split)).toEqual([true, true]);

    const drinksOnly = mixed();
    drinksOnly.orders[0].items = [line("Pils", "bar", 800)];
    drinksOnly.orders[0].tickets = [ticket("bar", "pending")];
    expect(listTickets(applySnapshot(drinksOnly), ["pending"], "all")[0].split).toBe(false);
  });

  it("treats an order without stored tickets as one ticket per station at the order's status", () => {
    const old = mixed();
    const legacy = { ...old.orders[0], tickets: undefined, status: "accepted" } as unknown as Order;
    const state = applySnapshot({ ...old, orders: [legacy] });
    expect(stations(state, "accepted")).toEqual(["kitchen", "bar"]);
  });
});

describe("what the floor and the check read from the board", () => {
  const seated = (): StaffBoard => {
    const base = board(1, "pending");
    return {
      ...base,
      sessions: [{ ...base.sessions[0], joinCode: "K7QM" }],
      orders: [
        {
          ...order(1),
          _id: "order-late",
          createdAt: "2026-01-01T00:10:00.000Z",
          items: [line("Pils", "bar", 800), line("Pizza", "kitchen", 1000)],
          tickets: [ticket("kitchen", "preparing"), ticket("bar", "ready")],
          totalCents: 1800,
        },
        {
          ...order(1, "served"),
          _id: "order-early",
          createdAt: "2026-01-01T00:05:00.000Z",
          items: [line("Cola", "bar", 300)],
          tickets: [ticket("bar", "served")],
          totalCents: 300,
        },
        { ...order(1, "cancelled"), _id: "order-gone", tickets: [ticket("bar", "cancelled")], totalCents: 900 },
      ],
    };
  };

  it("counts a table's open and ready tickets and leaves cancelled orders off its bill", () => {
    expect(summariseTables(applySnapshot(seated()))).toEqual({
      "table-1": { open: 2, ready: 1, totalCents: 2100, oldestOpenAt: "2026-01-01T00:10:00.000Z" },
    });
  });

  it("has nothing to say about a table with no orders", () => {
    expect(summariseTables(applySnapshot({ ...seated(), orders: [] }))).toEqual({});
  });

  it("puts a table's live orders on its check, oldest first", () => {
    const check = tableCheck(applySnapshot(seated()), "table-1");
    expect(check.orders.map((listed) => listed._id)).toEqual(["order-early", "order-late"]);
    expect(check.totalCents).toBe(2100);
    expect(check.sessionId).toBe("session-1");
    expect(check.joinCode).toBe("K7QM");
    expect(check.table?.tableNumber).toBe(4);
  });

  it("gives a free table an empty check", () => {
    const check = tableCheck(applySnapshot(seated()), "table-unknown");
    expect(check).toEqual({ table: undefined, sessionId: undefined, joinCode: undefined, orders: [], totalCents: 0 });
  });
});
