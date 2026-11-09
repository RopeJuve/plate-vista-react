import { sumCents } from "../../shared/money/formatCents";
import type { Order, ServerEvent } from "../../shared/realtime/protocol";
import { withStatusChange } from "../../shared/realtime/tickets";

export type BillOrder = Order & { cancelReason?: string };

/** The bill was settled. The receipt is unknown when only a refused order told us so. */
export type PaidBill = { receiptToken: string | null };

export type BillState = {
  ordersById: Record<string, BillOrder>;
  closed: boolean;
  /** Set once the bill is paid: nothing more can be ordered on it. */
  paid: PaidBill | null;
};

export const emptyBill = (): BillState => ({
  ordersById: {},
  closed: false,
  paid: null,
});

/** The payment on the server's bill, if it has one. A bill without one never un-pays a known payment. */
export const withServerPayment = (state: BillState, payment: { receiptToken: string } | null): BillState =>
  payment ? { ...state, paid: { receiptToken: payment.receiptToken } } : state;

/** An order was refused because the bill is paid. Keeps the receipt if it is already known. */
export const markBillPaid = (state: BillState): BillState =>
  state.paid ? state : { ...state, paid: { receiptToken: null } };

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
    case "bill.paid":
      if (event.data.sessionId !== sessionId) {
        return state;
      }
      return { ...state, paid: { receiptToken: event.data.receiptToken } };
    default:
      return state;
  }
};

export const billOrders = (state: BillState): BillOrder[] =>
  Object.values(state.ordersById).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

/** Orders the guest still pays for: everything not cancelled outright. */
export const payableOrders = <T extends Pick<Order, "status">>(orders: T[]): T[] =>
  orders.filter((order) => order.status !== "cancelled");

export const payableCents = (orders: Pick<Order, "status" | "totalCents">[]): number =>
  sumCents(payableOrders(orders).map((order) => order.totalCents));

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
    const paid = parsed.paid && typeof parsed.paid === "object" ? { receiptToken: parsed.paid.receiptToken ?? null } : null;
    return { ordersById: parsed.ordersById, closed: Boolean(parsed.closed), paid };
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
