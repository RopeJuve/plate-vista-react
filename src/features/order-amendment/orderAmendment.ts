import { LIMITS, type Order, type OrderCreateItemInput, type OrderItem } from "../../shared/realtime/protocol";

type AmendableOrder = Pick<Order, "_id" | "items">;

/** The quantities being changed on one placed order, before they are saved. */
export type AmendmentDraft = {
  orderId: string;
  quantities: Record<string, number>;
};

export const beginDraft = (order: AmendableOrder): AmendmentDraft => ({
  orderId: order._id,
  quantities: Object.fromEntries(order.items.map((item) => [item.productId, item.quantity])),
});

/** The quantity to show for a line: the drafted one while its order is being amended. */
export const draftQuantity = (
  draft: AmendmentDraft | null,
  order: AmendableOrder,
  item: Pick<OrderItem, "productId" | "quantity">
): number => (draft?.orderId === order._id ? draft.quantities[item.productId] ?? item.quantity : item.quantity);

/** A line cannot be amended away: removing everything is a cancellation. */
export const stepQuantity = (
  draft: AmendmentDraft,
  item: Pick<OrderItem, "productId" | "quantity">,
  delta: number
): AmendmentDraft => {
  const current = draft.quantities[item.productId] ?? item.quantity;
  const next = Math.min(LIMITS.MAX_QUANTITY_PER_ITEM, Math.max(1, current + delta));
  return { ...draft, quantities: { ...draft.quantities, [item.productId]: next } };
};

/** The order's lines as `order.update` wants them, with the drafted quantities. */
export const amendedItems = (draft: AmendmentDraft, order: AmendableOrder): OrderCreateItemInput[] =>
  order.items.map((item) => ({
    productId: item.productId,
    quantity: draftQuantity(draft, order, item),
    notes: item.notes,
  }));
