import { describe, expect, it } from "vitest";
import type { Order } from "../../../types";
import { orderStatusBadge } from "../orderStatusBadge";
import { readOrdersPayload, shortOrderId, toOrderRows } from "../orderRows";

const protocolOrder = {
  _id: "64f0c0ffee00a1b2c3",
  status: "ready",
  totalCents: 1250,
  tableId: "t7",
  items: [
    { title: "Soup", quantity: 2 },
    { quantity: 1 },
  ],
} as unknown as Order;

const legacyOrder: Order = {
  _id: "legacy",
  user: { username: "maria" },
  totalPrice: 9.5,
  orderStatus: "served",
  tableNumber: 3,
  menuItems: [{ product: { title: "Wine" }, quantity: 1 }, "dangling-id"],
};

describe("order rows", () => {
  it("reads a page of orders and the overall count", () => {
    expect(readOrdersPayload({ orders: [protocolOrder], total: 41 })).toEqual({ orders: [protocolOrder], total: 41 });
    expect(readOrdersPayload({ items: [protocolOrder], count: 7 }).total).toBe(7);
    expect(readOrdersPayload([protocolOrder]).total).toBe(1);
  });

  it("turns a protocol order into a row, finding its table by id", () => {
    expect(toOrderRows([protocolOrder], { t7: 7 })).toEqual([
      {
        user: "Guest User",
        menuItems: [
          { title: "Soup", quantity: 2 },
          { title: "Unavailable item", quantity: 1 },
        ],
        quantity: 3,
        totalPrice: 1250,
        orderStatus: "ready",
        location: 7,
        orderId: "64f0c0ffee00a1b2c3",
      },
    ]);
  });

  it("keeps a legacy order's own table number, euros and product lines", () => {
    const [row] = toOrderRows([legacyOrder], { legacy: 99 });
    expect(row.user).toBe("maria");
    expect(row.menuItems).toEqual([{ title: "Wine", quantity: 1 }]);
    expect(row.totalPrice).toBe(950);
    expect(row.location).toBe(3);
  });

  it("shortens an order id the way staff read it out", () => {
    expect(shortOrderId("64f0c0ffee00a1b2c3")).toBe("#A1B2C3");
    expect(shortOrderId(undefined)).toBe("");
  });

  it("labels a known status and leaves an unknown one as sent", () => {
    expect(orderStatusBadge("pending").className).toBe("bg-signal text-ink");
    expect(orderStatusBadge("PAID")).toEqual({ className: "", label: "PAID" });
    expect(orderStatusBadge(undefined)).toEqual({ className: "", label: "" });
  });
});
