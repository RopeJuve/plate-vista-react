import api from "./api";

const restaurantHeaders = (restaurantId?: string) =>
  restaurantId ? { "x-restaurant-id": restaurantId } : {};

export const fetchMenuItems = (restaurantId?: string, params?) =>
  api.get("/menu-items", {
    params,
    headers: restaurantHeaders(restaurantId),
  });

export const updateMenuItem = (id, item, restaurantId?: string) =>
  api.put(`/menu-items/${id}`, item, {
    headers: {
      ...restaurantHeaders(restaurantId),
      "Content-Type": "multipart/form-data",
    },
  });

export const addMenuItem = (item, restaurantId?: string) =>
  api.post("/menu-items", item, {
    headers: {
      ...restaurantHeaders(restaurantId),
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteMenuItem = (id, restaurantId?: string) =>
  api.delete(`/menu-items/${id}`, {
    headers: restaurantHeaders(restaurantId),
  });

export const fetchCategories = (restaurantId?: string) =>
  api.get("/menu-items/category", {
    headers: restaurantHeaders(restaurantId),
  });
