import api from "./api";
import { unwrapList } from "../features/guest-ordering/menu";

const readOrdersPayload = (data: unknown) => {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const orders = unwrapList(data, ["orders", "items", "data"]) as Array<{
    totalCents?: number;
    totalPrice?: number;
    createdAt?: string;
    menuItems?: unknown[];
  }>;
  const total =
    typeof record?.total === "number"
      ? record.total
      : typeof record?.count === "number"
        ? record.count
        : orders.length;
  return { orders, total };
};

export const fetchOrders = (params?: { page?: number; limit?: number }) => api.get("/orders", { params });

export { readOrdersPayload };
