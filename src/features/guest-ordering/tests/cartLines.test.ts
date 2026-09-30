import { describe, expect, it } from "vitest";
import { LIMITS } from "../../../shared/realtime/protocol";
import { addLine, removeLine, restoreLines, setLineNotes, setLineQuantity } from "../cartLines";

const soup = { productId: "soup", quantity: 2, notes: "" };
const cola = { productId: "cola", quantity: 1, notes: "no ice" };

describe("cart lines", () => {
  it("adds a new product as one, and one more of a product already there", () => {
    expect(addLine([], "soup")).toEqual([{ productId: "soup", quantity: 1, notes: "" }]);
    expect(addLine([soup, cola], "soup")).toEqual([{ ...soup, quantity: 3 }, cola]);
  });

  it("stops at the limits for one order", () => {
    const full = Array.from({ length: LIMITS.MAX_ITEMS_PER_ORDER }, (_, index) => ({
      productId: `p${index}`,
      quantity: 1,
      notes: "",
    }));
    expect(addLine(full, "one-too-many")).toBe(full);

    const maxed = [{ ...soup, quantity: LIMITS.MAX_QUANTITY_PER_ITEM }];
    expect(addLine(maxed, "soup")).toBe(maxed);
  });

  it("keeps a quantity whole and between one and the per-item limit", () => {
    expect(setLineQuantity([soup], "soup", 0)[0].quantity).toBe(1);
    expect(setLineQuantity([soup], "soup", 2.6)[0].quantity).toBe(3);
    expect(setLineQuantity([soup], "soup", 1000)[0].quantity).toBe(LIMITS.MAX_QUANTITY_PER_ITEM);
  });

  it("clips notes to what the kitchen ticket holds", () => {
    const long = "x".repeat(LIMITS.MAX_NOTES_LENGTH + 20);
    expect(setLineNotes([cola], "cola", long)[0].notes).toHaveLength(LIMITS.MAX_NOTES_LENGTH);
  });

  it("removes only the named line", () => {
    expect(removeLine([soup, cola], "soup")).toEqual([cola]);
  });

  it("restores stored lines within the limits and drops what is unusable", () => {
    expect(
      restoreLines([{ productId: "soup", quantity: 500 }, { quantity: 2 }, null, { productId: "cola", quantity: "x", notes: 5 }])
    ).toEqual([
      { productId: "soup", quantity: LIMITS.MAX_QUANTITY_PER_ITEM, notes: "" },
      { productId: "cola", quantity: 1, notes: "5" },
    ]);
    expect(restoreLines("not a list")).toEqual([]);
  });
});
