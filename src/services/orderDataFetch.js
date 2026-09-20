import api from "./api";

export const fetchOrders = (params) => api.get("/orders", { params });
