import type {
  BoardTable,
  ClosedSession,
  Order,
  OrderStatus,
  ServerEvent,
  Session,
  StaffBoard,
  Station,
  Ticket,
} from "../../shared/realtime/protocol";
import { sumCents } from "../../shared/money/formatCents";
import { ticketsOf, withStatusChange } from "../../shared/realtime/tickets";

export type TrackedOrder = Order & { cancelReason?: string };

export type BoardState = {
  ordersById: Record<string, TrackedOrder>;
  orderIdsBySession: Record<string, string[]>;
  sessionsById: Record<string, Session>;
  sessionIdByTable: Record<string, string>;
  tablesById: Record<string, BoardTable>;
  /** Tables closed in the last 12 hours, newest first. */
  recentlyClosed: ClosedSession[];
  ready: boolean;
};

const MAX_RECENTLY_CLOSED = 50;

export const emptyBoard = (): BoardState => ({
  ordersById: {},
  orderIdsBySession: {},
  sessionsById: {},
  sessionIdByTable: {},
  tablesById: {},
  recentlyClosed: [],
  ready: false,
});

const isNewer = (storedRev: number | undefined, incomingRev: number) =>
  storedRev === undefined || incomingRev > storedRev;

const withOrder = (state: BoardState, order: TrackedOrder): BoardState => {
  const ids = state.orderIdsBySession[order.sessionId] ?? [];
  const nextIds = ids.includes(order._id) ? ids : [...ids, order._id];
  return {
    ...state,
    ordersById: { ...state.ordersById, [order._id]: order },
    orderIdsBySession: { ...state.orderIdsBySession, [order.sessionId]: nextIds },
  };
};

export const applySnapshot = (board: StaffBoard): BoardState => {
  let state = emptyBoard();
  const sessionIdByTable: Record<string, string> = {};
  const sessionsById: Record<string, Session> = {};
  board.sessions.forEach((session) => {
    sessionsById[session._id] = session;
    if (session.status !== "closed") {
      sessionIdByTable[session.tableId] = session._id;
    }
  });
  const tablesById: Record<string, BoardTable> = {};
  board.tables.forEach((table) => {
    const occupied = Boolean(sessionIdByTable[table._id]);
    tablesById[table._id] = {
      ...table,
      // Only an open session seats a table; a stored "occupied" can be stale.
      status: occupied ? "occupied" : table.status === "reserved" ? "reserved" : "vacant",
    };
  });
  state = {
    ...state,
    sessionsById,
    sessionIdByTable,
    tablesById,
    recentlyClosed: board.recentlyClosed.slice(0, MAX_RECENTLY_CLOSED),
    ready: true,
  };
  board.orders.forEach((order) => {
    state = withOrder(state, order);
  });
  return state;
};

export const applyServerEvent = (state: BoardState, event: ServerEvent): BoardState => {
  switch (event.event) {
    case "session.opened": {
      const session = event.data.session;
      const table = state.tablesById[session.tableId];
      return {
        ...state,
        sessionsById: { ...state.sessionsById, [session._id]: session },
        sessionIdByTable: { ...state.sessionIdByTable, [session.tableId]: session._id },
        tablesById: table
          ? { ...state.tablesById, [session.tableId]: { ...table, status: "occupied" } }
          : state.tablesById,
      };
    }
    case "order.created":
    case "order.updated": {
      const incoming = event.data.order;
      const current = state.ordersById[incoming._id];
      if (!isNewer(current?.rev, incoming.rev)) {
        return state;
      }
      return withOrder(state, {
        ...incoming,
        cancelReason: current?.cancelReason,
      });
    }
    case "order.statusChanged": {
      const { orderId, rev, reason } = event.data;
      const current = state.ordersById[orderId];
      if (!current || !isNewer(current.rev, rev)) {
        return state;
      }
      return {
        ...state,
        ordersById: {
          ...state.ordersById,
          [orderId]: {
            ...withStatusChange(current, event.data),
            cancelReason: reason ?? current.cancelReason,
          },
        },
      };
    }
    case "session.closed": {
      const { sessionId, tableId } = event.data;
      const ids = state.orderIdsBySession[sessionId] ?? [];
      const closedSession = state.sessionsById[sessionId];
      const closedEntry: ClosedSession | null = closedSession
        ? {
            _id: sessionId,
            tableId,
            tableNumber: state.tablesById[tableId]?.tableNumber ?? closedSession.tableNumber,
            status: "closed",
            openedAt: closedSession.openedAt,
            closedAt: new Date().toISOString(),
            totalCents: ids.reduce((total, id) => {
              const order = state.ordersById[id];
              return order && order.status !== "cancelled" ? total + order.totalCents : total;
            }, 0),
          }
        : null;
      const recentlyClosed = closedEntry
        ? [closedEntry, ...state.recentlyClosed.filter((entry) => entry._id !== sessionId)].slice(
            0,
            MAX_RECENTLY_CLOSED
          )
        : state.recentlyClosed;
      const ordersById = { ...state.ordersById };
      ids.forEach((id) => {
        delete ordersById[id];
      });
      const orderIdsBySession = { ...state.orderIdsBySession };
      delete orderIdsBySession[sessionId];
      const sessionsById = { ...state.sessionsById };
      delete sessionsById[sessionId];
      const sessionIdByTable = { ...state.sessionIdByTable };
      delete sessionIdByTable[tableId];
      const table = state.tablesById[tableId];
      return {
        ...state,
        ordersById,
        orderIdsBySession,
        sessionsById,
        sessionIdByTable,
        recentlyClosed,
        tablesById: table
          ? { ...state.tablesById, [tableId]: { ...table, status: "vacant" } }
          : state.tablesById,
      };
    }
    default:
      return state;
  }
};

export type BoardAction =
  | { type: "hydrate"; board: StaffBoard; events: ServerEvent[] }
  | { type: "event"; event: ServerEvent };

export const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  if (action.type === "hydrate") {
    return action.events.reduce(applyServerEvent, applySnapshot(action.board));
  }
  if (!state.ready) {
    return state;
  }
  return applyServerEvent(state, action.event);
};

export type ListedTicket = {
  order: TrackedOrder;
  ticket: Ticket;
  /** The order has a ticket at the other station too. */
  split: boolean;
  tableNumber: number;
};

/** The rail hangs one chit per ticket: an order with drinks and food shows as two. */
export const listTickets = (
  state: BoardState,
  statuses: OrderStatus[],
  station: Station | "all"
): ListedTicket[] => {
  const allowed = new Set(statuses);
  return Object.values(state.ordersById)
    .flatMap((order) => {
      const tickets = ticketsOf(order);
      return tickets
        .filter((ticket) => allowed.has(ticket.status))
        .filter((ticket) => station === "all" || ticket.station === station)
        .map((ticket) => ({
          order,
          ticket,
          split: tickets.length > 1,
          tableNumber:
            state.tablesById[order.tableId]?.tableNumber ??
            state.sessionsById[order.sessionId]?.tableNumber ??
            0,
        }));
    })
    .sort((a, b) => a.order.createdAt.localeCompare(b.order.createdAt));
};

export type TableSummary = {
  /** Tickets not served yet. */
  open: number;
  /** Tickets waiting at the pass. */
  ready: number;
  totalCents: number;
  /** When the oldest open ticket was ordered; empty when everything is served. */
  oldestOpenAt: string;
};

/** What each table's tile shows, by table id. A table with no live order has no entry. */
export const summariseTables = (state: BoardState): Record<string, TableSummary> => {
  const byTable: Record<string, TableSummary> = {};
  Object.values(state.ordersById).forEach((order) => {
    if (order.status === "cancelled") {
      return;
    }
    const summary = (byTable[order.tableId] ??= { open: 0, ready: 0, totalCents: 0, oldestOpenAt: "" });
    summary.totalCents = sumCents([summary.totalCents, order.totalCents]);
    ticketsOf(order).forEach((ticket) => {
      if (ticket.status === "cancelled") {
        return;
      }
      if (ticket.status === "ready") {
        summary.ready += 1;
      }
      if (ticket.status !== "served") {
        summary.open += 1;
        if (!summary.oldestOpenAt || order.createdAt < summary.oldestOpenAt) {
          summary.oldestOpenAt = order.createdAt;
        }
      }
    });
  });
  return byTable;
};

export type TableCheck = {
  table?: BoardTable;
  /** The open session at the table; none while the table is free. */
  sessionId?: string;
  joinCode?: string;
  /** The orders that count towards the check, oldest first. */
  orders: TrackedOrder[];
  totalCents: number;
};

/** The check for one table: who is sitting there and what they owe so far. */
export const tableCheck = (state: BoardState, tableId: string): TableCheck => {
  const sessionId = state.sessionIdByTable[tableId];
  const orders = Object.values(state.ordersById)
    .filter((order) => order.tableId === tableId && order.status !== "cancelled")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return {
    table: state.tablesById[tableId],
    sessionId,
    joinCode: sessionId ? state.sessionsById[sessionId]?.joinCode : undefined,
    orders,
    totalCents: sumCents(orders.map((order) => order.totalCents)),
  };
};
