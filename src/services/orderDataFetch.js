import api from "./api";

export const fetchOrders = (params) => api.get("/orders", { params });

export const fetchAllOrders = async () => {
  const limit = 100;
  const orders = [];
  let page = 1;
  let total = Infinity;

  while (orders.length < total) {
    const { data } = await fetchOrders({ page, limit });
    const pageOrders = Array.isArray(data) ? data : data?.orders ?? [];
    total = Array.isArray(data) ? pageOrders.length : data?.total ?? pageOrders.length;
    orders.push(...pageOrders);

    if (pageOrders.length === 0 || pageOrders.length < limit) {
      break;
    }
    page += 1;
  }

  return { orders, total: Number.isFinite(total) ? total : orders.length };
};
