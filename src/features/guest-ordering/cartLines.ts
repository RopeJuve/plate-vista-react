import { LIMITS } from "../../shared/realtime/protocol";
import type { CartLine } from "./types";

// The lines someone is about to order: a guest's cart or the staff pad. Both
// keep them within what the server accepts for one order.

const clampQuantity = (quantity: number) =>
  Math.min(LIMITS.MAX_QUANTITY_PER_ITEM, Math.max(1, Math.round(quantity)));

const clipNotes = (notes: string) => notes.slice(0, LIMITS.MAX_NOTES_LENGTH);

const changeLine = (lines: CartLine[], productId: string, change: (line: CartLine) => CartLine): CartLine[] =>
  lines.map((line) => (line.productId === productId ? change(line) : line));

/** One more of a product. A full order, or a line already at its limit, stays as it is. */
export const addLine = (lines: CartLine[], productId: string): CartLine[] => {
  const existing = lines.find((line) => line.productId === productId);
  if (!existing) {
    return lines.length >= LIMITS.MAX_ITEMS_PER_ORDER ? lines : [...lines, { productId, quantity: 1, notes: "" }];
  }
  if (existing.quantity >= LIMITS.MAX_QUANTITY_PER_ITEM) {
    return lines;
  }
  return changeLine(lines, productId, (line) => ({ ...line, quantity: line.quantity + 1 }));
};

/** A line never drops below one: taking it off the order is `removeLine`. */
export const setLineQuantity = (lines: CartLine[], productId: string, quantity: number): CartLine[] =>
  changeLine(lines, productId, (line) => ({ ...line, quantity: clampQuantity(quantity) }));

export const setLineNotes = (lines: CartLine[], productId: string, notes: string): CartLine[] =>
  changeLine(lines, productId, (line) => ({ ...line, notes: clipNotes(notes) }));

export const removeLine = (lines: CartLine[], productId: string): CartLine[] =>
  lines.filter((line) => line.productId !== productId);

/** Lines read back from storage, which may be stale or hand-edited: keep what is usable, within the limits. */
export const restoreLines = (stored: unknown): CartLine[] => {
  if (!Array.isArray(stored)) {
    return [];
  }
  return stored
    .filter((item): item is Partial<CartLine> & { productId: string } => Boolean(item) && typeof item.productId === "string")
    .map((item) => ({
      productId: item.productId,
      quantity: Math.min(LIMITS.MAX_QUANTITY_PER_ITEM, Math.max(1, Number(item.quantity) || 1)),
      notes: clipNotes(String(item.notes || "")),
    }));
};
