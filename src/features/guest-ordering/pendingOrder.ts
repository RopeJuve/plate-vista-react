import type { OrderCreateItemInput } from "../../shared/realtime/protocol";
import type { CartLine } from "./types";

export type PendingOrder = {
  clientOrderId: string;
  items: OrderCreateItemInput[];
  fingerprint: string;
  tableId?: string;
};

export const toOrderItems = (lines: CartLine[]): OrderCreateItemInput[] =>
  lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    notes: line.notes,
  }));

export const cartFingerprint = (items: OrderCreateItemInput[]): string =>
  JSON.stringify(
    items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      notes: item.notes ?? "",
    }))
  );

/**
 * Keeps the same clientOrderId until the cart contents change.
 * Retries of one submission must resend that id (BE-06, BE-27).
 */
export const resolveClientOrderId = (
  stored: PendingOrder | null,
  items: OrderCreateItemInput[],
  tableId?: string
): PendingOrder => {
  const fingerprint = cartFingerprint(items);
  if (stored && stored.fingerprint === fingerprint) {
    return tableId ? { ...stored, tableId } : stored;
  }
  return {
    clientOrderId: crypto.randomUUID(),
    items,
    fingerprint,
    tableId,
  };
};

const storageKey = (key: string) => `pending-order:${key}`;

export const loadPending = (key: string): PendingOrder | null => {
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PendingOrder;
    if (!parsed?.clientOrderId || !Array.isArray(parsed.items)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const savePending = (key: string, pending: PendingOrder) => {
  localStorage.setItem(storageKey(key), JSON.stringify(pending));
};

export const clearPending = (key: string) => {
  localStorage.removeItem(storageKey(key));
};

export const invalidatePendingIfCartChanged = (key: string, items: OrderCreateItemInput[]) => {
  const pending = loadPending(key);
  if (pending && pending.fingerprint !== cartFingerprint(items)) {
    clearPending(key);
  }
};
