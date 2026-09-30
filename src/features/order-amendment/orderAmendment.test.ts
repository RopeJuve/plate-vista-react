import { describe, expect, it } from "vitest";
import { LIMITS, type OrderItem } from "../../shared/realtime/protocol";
import { amendedItems, beginDraft, draftQuantity, stepQuantity } from "./orderAmendment";

const line = (productId: string, quantity: number, notes = ""): OrderItem => ({
  productId,
  title: productId,
  quantity,
  notes,
  unitPriceCents: 450,
  lineTotalCents: 450 * quantity,
  station: "kitchen",
});

const order = { _id: "o1", items: [line("soup", 2, "no onions"), line("cola", 1)] };
const other = { _id: "o2", items: [line("soup", 5)] };

describe("order amendment", () => {
  it("starts from the order's own quantities", () => {
    const draft = beginDraft(order);
    expect(draftQuantity(draft, order, order.items[0])).toBe(2);
    expect(draftQuantity(draft, order, order.items[1])).toBe(1);
  });

  it("steps one line and leaves the others alone", () => {
    const draft = stepQuantity(beginDraft(order), order.items[0], 1);
    expect(draftQuantity(draft, order, order.items[0])).toBe(3);
    expect(draftQuantity(draft, order, order.items[1])).toBe(1);
  });

  it("keeps a quantity between 1 and the per-item limit", () => {
    const atOne = stepQuantity(beginDraft(order), order.items[1], -1);
    expect(draftQuantity(atOne, order, order.items[1])).toBe(1);

    const full = { _id: "o3", items: [line("soup", LIMITS.MAX_QUANTITY_PER_ITEM)] };
    const atMax = stepQuantity(beginDraft(full), full.items[0], 1);
    expect(draftQuantity(atMax, full, full.items[0])).toBe(LIMITS.MAX_QUANTITY_PER_ITEM);
  });

  it("does not leak a draft into another order with the same product", () => {
    const draft = stepQuantity(beginDraft(order), order.items[0], 1);
    expect(draftQuantity(draft, other, other.items[0])).toBe(5);
    expect(draftQuantity(null, order, order.items[0])).toBe(2);
  });

  it("sends every line with its drafted quantity and its notes", () => {
    const draft = stepQuantity(beginDraft(order), order.items[1], 1);
    expect(amendedItems(draft, order)).toEqual([
      { productId: "soup", quantity: 2, notes: "no onions" },
      { productId: "cola", quantity: 2, notes: "" },
    ]);
  });
});
