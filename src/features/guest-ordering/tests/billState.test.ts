import { describe, expect, it } from "vitest";
import { payableCents, payableOrders } from "../billState";

const soup = { status: "served" as const, totalCents: 900 };
const cola = { status: "pending" as const, totalCents: 300 };
const wine = { status: "cancelled" as const, totalCents: 1200 };

describe("bill totals", () => {
  it("leaves cancelled orders off what the guest pays", () => {
    expect(payableOrders([soup, wine, cola])).toEqual([soup, cola]);
    expect(payableCents([soup, wine, cola])).toBe(1200);
  });

  it("owes nothing on an empty bill", () => {
    expect(payableCents([])).toBe(0);
  });
});
