import { LIMITS } from "../../shared/realtime/protocol";
import type { MenuRecord } from "./menu";
import type { CartLine } from "./types";

export type CartCheck = {
  blocking: boolean;
  messages: string[];
  unavailableIds: string[];
};

export const checkCart = (lines: CartLine[], menuById: Record<string, MenuRecord | undefined>): CartCheck => {
  const messages: string[] = [];
  const unavailableIds: string[] = [];

  if (lines.length > LIMITS.MAX_ITEMS_PER_ORDER) {
    messages.push(`An order can include at most ${LIMITS.MAX_ITEMS_PER_ORDER} items.`);
  }

  lines.forEach((line, index) => {
    const menuItem = menuById[line.productId];
    if (!menuItem || menuItem.archived || !menuItem.inStock) {
      unavailableIds.push(line.productId);
      messages.push(`${menuItem?.title || "An item"} is unavailable.`);
    }
    if (line.quantity < 1 || line.quantity > LIMITS.MAX_QUANTITY_PER_ITEM) {
      messages.push(`Item ${index + 1} quantity must be between 1 and ${LIMITS.MAX_QUANTITY_PER_ITEM}.`);
    }
    if (line.notes.length > LIMITS.MAX_NOTES_LENGTH) {
      messages.push(`Notes must be ${LIMITS.MAX_NOTES_LENGTH} characters or fewer.`);
    }
  });

  return {
    blocking: messages.length > 0,
    messages: [...new Set(messages)],
    unavailableIds,
  };
};
