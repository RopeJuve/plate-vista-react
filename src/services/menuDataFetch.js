import api from "./api";

const restaurantHeaders = (restaurantId) =>
  restaurantId ? { "x-restaurant-id": restaurantId } : {};

export const fetchMenuItems = (restaurantId, params) =>
  api.get("/menu-items", {
    params,
    headers: restaurantHeaders(restaurantId),
  });

export const updateMenuItem = (id, item, restaurantId) =>
  api.put(`/menu-items/${id}`, item, {
    headers: {
      ...restaurantHeaders(restaurantId),
      "Content-Type": "multipart/form-data",
    },
  });

export const addMenuItem = (item, restaurantId) =>
  api.post("/menu-items", item, {
    headers: {
      ...restaurantHeaders(restaurantId),
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteMenuItem = (id, restaurantId) =>
  api.delete(`/menu-items/${id}`, {
    headers: restaurantHeaders(restaurantId),
  });

export const fetchCategories = (restaurantId) =>
  api.get("/menu-items/category", {
    headers: restaurantHeaders(restaurantId),
  });
