import { readCents } from "../../shared/money/formatCents";
import type { Order, OrderRow } from "../../types";
import { unwrapList } from "../guest-ordering/menu";

/** Orders per page of the admin's order history. */
export const ORDERS_PAGE_SIZE = 20;

const UNAVAILABLE_ITEM = "Unavailable item";

/** One page of `GET /orders`, and how many orders there are in all. */
export const readOrdersPayload = (data: unknown): { orders: Order[]; total: number } => {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const orders = unwrapList(data, ["orders", "items", "data"]) as Order[];
  const total =
    typeof record?.total === "number" ? record.total : typeof record?.count === "number" ? record.count : orders.length;
  return { orders, total };
};

const lineItems = (order: Order): OrderRow["menuItems"] => {
  const protocolItems = (order as { items?: Array<{ title?: string; quantity?: number }> }).items;
  if (protocolItems) {
    return protocolItems.map((item) => ({ title: item.title || UNAVAILABLE_ITEM, quantity: item.quantity || 0 }));
  }
  return (order.menuItems || []).flatMap((item) =>
    typeof item === "object" && item.product
      ? [{ title: item.product.title ?? UNAVAILABLE_ITEM, quantity: item.quantity || 0 }]
      : []
  );
};

/**
 * Orders as rows of the admin's order table. A protocol order carries only
 * `tableId`, so the table number is resolved against `tableNumbersById`;
 * legacy payloads that already embed the number still win.
 */
export const toOrderRows = (orders: Order[] = [], tableNumbersById: Record<string, number> = {}): OrderRow[] =>
  orders.map((order) => {
    const menuItems = lineItems(order);
    return {
      user: typeof order.user === "string" ? order.user : order.user?.username || "Guest User",
      menuItems,
      quantity: menuItems.reduce((total, item) => total + (item.quantity || 0), 0),
      totalPrice: readCents((order as { totalCents?: number }).totalCents, order.totalPrice),
      orderStatus: (order as { status?: string }).status || order.orderStatus,
      location:
        order.tableNumber ??
        order.table?.tableNumber ??
        tableNumbersById[String((order as { tableId?: string }).tableId ?? "")] ??
        "",
      orderId: order._id,
    };
  });

/** The last six characters of an order id, as staff read it out: "#A1B2C3". */
export const shortOrderId = (orderId?: string): string => (orderId ? `#${orderId.slice(-6).toUpperCase()}` : "");
