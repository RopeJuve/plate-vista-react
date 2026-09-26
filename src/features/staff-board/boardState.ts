import type {
  BoardTable,
  Order,
  OrderStatus,
  ServerEvent,
  Session,
  StaffBoard,
  Station,
} from "../../shared/realtime/protocol";

export type TrackedOrder = Order & { cancelReason?: string };

export type BoardState = {
  ordersById: Record<string, TrackedOrder>;
  orderIdsBySession: Record<string, string[]>;
  sessionsById: Record<string, Session>;
  sessionIdByTable: Record<string, string>;
  tablesById: Record<string, BoardTable>;
  ready: boolean;
};

export const emptyBoard = (): BoardState => ({
  ordersById: {},
  orderIdsBySession: {},
  sessionsById: {},
  sessionIdByTable: {},
  tablesById: {},
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
      status: occupied ? "occupied" : table.status === "reserved" ? "reserved" : table.status,
    };
  });
  state = {
    ...state,
    sessionsById,
    sessionIdByTable,
    tablesById,
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
      const { orderId, status, rev, reason } = event.data;
      const current = state.ordersById[orderId];
      if (!current || !isNewer(current.rev, rev)) {
        return state;
      }
      return {
        ...state,
        ordersById: {
          ...state.ordersById,
          [orderId]: {
            ...current,
            status,
            rev,
            cancelReason: reason ?? current.cancelReason,
          },
        },
      };
    }
    case "session.closed": {
      const { sessionId, tableId } = event.data;
      const ids = state.orderIdsBySession[sessionId] ?? [];
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

export type ListedOrder = {
  order: TrackedOrder;
  tableNumber: number;
};

export const listOrders = (
  state: BoardState,
  statuses: OrderStatus[],
  station: Station | "all"
): ListedOrder[] => {
  const allowed = new Set(statuses);
  return Object.values(state.ordersById)
    .filter((order) => allowed.has(order.status))
    .filter((order) => station === "all" || order.items.some((item) => item.station === station))
    .map((order) => ({
      order,
      tableNumber:
        state.tablesById[order.tableId]?.tableNumber ??
        state.sessionsById[order.sessionId]?.tableNumber ??
        0,
    }))
    .sort((a, b) => a.order.createdAt.localeCompare(b.order.createdAt));
};
