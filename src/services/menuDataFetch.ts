import api from "./api";

const restaurantHeaders = (restaurantId?: string | null) =>
  restaurantId ? { "x-restaurant-id": restaurantId } : {};

export const fetchMenuItems = (restaurantId?: string | null, params?: Record<string, unknown>) =>
  api.get("/menu-items", {
    params,
    headers: restaurantHeaders(restaurantId),
  });

export const updateMenuItem = (id: string, item: FormData | Record<string, unknown>, restaurantId?: string | null) =>
  api.put(`/menu-items/${id}`, item, {
    headers: restaurantHeaders(restaurantId),
  });

export const addMenuItem = (item: FormData | Record<string, unknown>, restaurantId?: string | null) =>
  api.post("/menu-items", item, {
    headers: restaurantHeaders(restaurantId),
  });

export const deleteMenuItem = (id: string, restaurantId?: string | null) =>
  api.delete(`/menu-items/${id}`, {
    headers: restaurantHeaders(restaurantId),
  });
