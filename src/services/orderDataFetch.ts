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

export const fetchAllOrders = async () => {
  const limit = 100;
  const orders: Array<{ totalCents?: number; totalPrice?: number; createdAt?: string; menuItems?: unknown[] }> = [];
  let page = 1;
  let total = Infinity;

  while (orders.length < total) {
    const { data } = await fetchOrders({ page, limit });
    const pageResult = readOrdersPayload(data);
    total = pageResult.total;
    orders.push(...pageResult.orders);

    if (pageResult.orders.length === 0 || pageResult.orders.length < limit) {
      break;
    }
    page += 1;
  }

  return { orders, total: Number.isFinite(total) ? total : orders.length };
};

export { readOrdersPayload };
