import type { Order, ServerEvent } from "../../shared/realtime/protocol";
import { withStatusChange } from "../../shared/realtime/tickets";

export type BillOrder = Order & { cancelReason?: string };

export type BillState = {
  ordersById: Record<string, BillOrder>;
  closed: boolean;
};

export const emptyBill = (): BillState => ({
  ordersById: {},
  closed: false,
});

const isNewer = (storedRev: number | undefined, incomingRev: number) =>
  storedRev === undefined || incomingRev > storedRev;

export const upsertBillOrder = (state: BillState, order: BillOrder): BillState => {
  const current = state.ordersById[order._id];
  if (!isNewer(current?.rev, order.rev)) {
    return state;
  }
  return {
    ...state,
    ordersById: {
      ...state.ordersById,
      [order._id]: { ...order, cancelReason: order.cancelReason ?? current?.cancelReason },
    },
  };
};

export const applyBillEvent = (state: BillState, event: ServerEvent, sessionId: string): BillState => {
  switch (event.event) {
    case "order.created":
    case "order.updated": {
      if (event.data.order.sessionId !== sessionId) {
        return state;
      }
      return upsertBillOrder(state, event.data.order);
    }
    case "order.statusChanged": {
      const current = state.ordersById[event.data.orderId];
      if (!current || !isNewer(current.rev, event.data.rev)) {
        return state;
      }
      return {
        ...state,
        ordersById: {
          ...state.ordersById,
          [current._id]: {
            ...withStatusChange(current, event.data),
            cancelReason: event.data.reason ?? current.cancelReason,
          },
        },
      };
    }
    case "session.closed":
      if (event.data.sessionId !== sessionId) {
        return state;
      }
      return { ...state, closed: true };
    default:
      return state;
  }
};

export const billOrders = (state: BillState): BillOrder[] =>
  Object.values(state.ordersById).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

const storageKey = (sessionId: string) => `bill:${sessionId}`;

export const loadBill = (sessionId: string): BillState => {
  try {
    const raw = localStorage.getItem(storageKey(sessionId));
    if (!raw) {
      return emptyBill();
    }
    const parsed = JSON.parse(raw) as BillState;
    if (!parsed?.ordersById) {
      return emptyBill();
    }
    return { ordersById: parsed.ordersById, closed: Boolean(parsed.closed) };
  } catch {
    return emptyBill();
  }
};

export const saveBill = (sessionId: string, state: BillState) => {
  localStorage.setItem(storageKey(sessionId), JSON.stringify(state));
};

export const clearBill = (sessionId: string) => {
  localStorage.removeItem(storageKey(sessionId));
};
