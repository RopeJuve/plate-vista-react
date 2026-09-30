import { describe, expect, it } from "vitest";
import type { OrderItem, Ticket } from "./protocol";
import { billedLines, isUntouched } from "./tickets";

const line = (title: string, station: OrderItem["station"]): OrderItem => ({
  productId: title,
  title,
  unitPriceCents: 100,
  quantity: 1,
  lineTotalCents: 100,
  notes: "",
  station,
});

const order = (kitchen: Ticket["status"], bar: Ticket["status"]) => ({
  status: "pending" as const,
  items: [line("Pizza", "kitchen"), line("Pils", "bar")],
  tickets: [
    { station: "kitchen" as const, status: kitchen, cancelReason: "" },
    { station: "bar" as const, status: bar, cancelReason: "" },
  ],
});

describe("tickets", () => {
  it("bills every line except those of a cancelled ticket", () => {
    expect(billedLines(order("cancelled", "served")).map((item) => item.title)).toEqual(["Pils"]);
    expect(billedLines(order("preparing", "served"))).toHaveLength(2);
  });

  it("still lists the lines of a fully cancelled order", () => {
    expect(billedLines(order("cancelled", "cancelled"))).toHaveLength(2);
  });

  it("locks the order once any station has started", () => {
    expect(isUntouched(order("pending", "pending"))).toBe(true);
    expect(isUntouched(order("pending", "accepted"))).toBe(false);
  });
});
