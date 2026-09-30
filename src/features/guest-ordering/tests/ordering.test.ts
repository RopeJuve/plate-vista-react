import { describe, expect, it } from "vitest";
import { LIMITS } from "../../../shared/realtime/protocol";
import { checkCart } from "../cartLimits";
import { resolveClientOrderId } from "../pendingOrder";
import type { MenuRecord } from "../menu";

const menuItem = (id: string, inStock = true): MenuRecord => ({
  _id: id,
  title: id,
  description: "",
  priceCents: 450,
  image: "",
  category: "food",
  inStock,
  station: "kitchen",
  popular: false,
  archived: false,
});

describe("place order idempotency", () => {
  it("reuses the clientOrderId until the cart changes", () => {
    const items = [{ productId: "p1", quantity: 1, notes: "" }];
    const first = resolveClientOrderId(null, items);
    const retry = resolveClientOrderId(first, items);
    expect(retry.clientOrderId).toBe(first.clientOrderId);

    const changed = resolveClientOrderId(first, [{ productId: "p1", quantity: 2, notes: "" }]);
    expect(changed.clientOrderId).not.toBe(first.clientOrderId);
  });
});

describe("cart limits", () => {
  it("blocks quantities, notes, and item counts the server would reject", () => {
    const tooMany = checkCart(
      Array.from({ length: LIMITS.MAX_ITEMS_PER_ORDER + 1 }, (_, index) => ({
        productId: `p${index}`,
        quantity: 1,
        notes: "",
      })),
      {}
    );
    expect(tooMany.blocking).toBe(true);

    const stock = checkCart(
      [{ productId: "p1", quantity: LIMITS.MAX_QUANTITY_PER_ITEM + 1, notes: "x".repeat(LIMITS.MAX_NOTES_LENGTH + 1) }],
      { p1: menuItem("p1", false) }
    );
    expect(stock.blocking).toBe(true);
    expect(stock.unavailableIds).toContain("p1");
  });
});
