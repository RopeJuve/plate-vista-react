import type { OrderItem, SessionBill } from "../../shared/realtime/protocol";

export const SESSION_ID = "session-1";

const items: OrderItem[] = [
  {
    productId: "dish-soup",
    title: "Tomato soup",
    unitPriceCents: 650,
    quantity: 2,
    lineTotalCents: 1300,
    notes: "",
    station: "kitchen",
    vatRate: "REDUCED_1",
  },
  {
    productId: "drink-wine",
    title: "House red",
    unitPriceCents: 750,
    quantity: 1,
    lineTotalCents: 750,
    notes: "",
    station: "bar",
    vatRate: "NORMAL",
  },
];

/** An open table with one order (food and a drink), not paid yet. */
export const unpaidBill: SessionBill = {
  sessionId: SESSION_ID,
  session: {
    _id: SESSION_ID,
    tableId: "table-4",
    status: "open",
    openedAt: "2026-11-07T18:30:00.000Z",
    closedAt: null,
  },
  orders: [
    {
      _id: "order-1",
      restaurantId: "restaurant-1",
      sessionId: SESSION_ID,
      tableId: "table-4",
      clientOrderId: "client-order-1",
      status: "served",
      rev: 3,
      tickets: [
        { station: "kitchen", status: "served", cancelReason: "" },
        { station: "bar", status: "served", cancelReason: "" },
      ],
      items,
      totalCents: 2050,
      createdAt: "2026-11-07T18:35:00.000Z",
      updatedAt: "2026-11-07T19:05:00.000Z",
    },
  ],
  totalCents: 2050,
  payment: null,
};
