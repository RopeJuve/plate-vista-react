import { useState } from "react";
import type { Order, OrderCreateItemInput, OrderItem } from "../../shared/realtime/protocol";
import { isUntouched } from "../../shared/realtime/tickets";
import { amendedItems, beginDraft, draftQuantity, stepQuantity, type AmendmentDraft } from "./orderAmendment";

/** Sends the amended lines and reports its own errors. Resolves false when the order was not saved. */
export type SaveAmendment = (orderId: string, items: OrderCreateItemInput[]) => Promise<boolean>;

/**
 * Changing the quantities of a placed order, one order at a time. The guest's
 * bill and the staff check both amend through this; they differ only in how
 * the change is sent, which is `saveAmendment`.
 */
export const useOrderAmendment = (saveAmendment: SaveAmendment) => {
  const [draft, setDraft] = useState<AmendmentDraft | null>(null);

  const step = (item: OrderItem, delta: number) =>
    setDraft((current) => (current ? stepQuantity(current, item, delta) : current));

  return {
    /** An order can be amended until a station has started on it. */
    canAmend: isUntouched,
    isAmending: (order: Order) => draft?.orderId === order._id,
    quantityOf: (order: Order, item: OrderItem) => draftQuantity(draft, order, item),
    begin: (order: Order) => setDraft(beginDraft(order)),
    increase: (item: OrderItem) => step(item, 1),
    decrease: (item: OrderItem) => step(item, -1),
    discard: () => setDraft(null),
    /** The draft stays open when the save fails, so nothing typed is lost. */
    save: async (order: Order) => {
      if (draft?.orderId !== order._id) {
        return;
      }
      if (await saveAmendment(order._id, amendedItems(draft, order))) {
        setDraft((current) => (current?.orderId === order._id ? null : current));
      }
    },
  };
};
