import api from "../../services/api";
import type { MenuItemValues } from "../../lib/schemas";
import type { MenuItem } from "../../types";
import { toMenuItemList, toMenuItemPayload } from "./menuItemForm";

const restaurantHeaders = (restaurantId?: string | null) =>
  restaurantId ? { "x-restaurant-id": restaurantId } : {};

export const fetchMenuItemList = async (restaurantId?: string | null) =>
  toMenuItemList((await api.get("/menu-items", { headers: restaurantHeaders(restaurantId) })).data);

export const createMenuItem = async (values: MenuItemValues, restaurantId?: string | null) =>
  (await api.post<MenuItem>("/menu-items", toMenuItemPayload(values), { headers: restaurantHeaders(restaurantId) })).data;

export const updateMenuItem = async (id: string, values: MenuItemValues, restaurantId?: string | null) =>
  (await api.put<MenuItem>(`/menu-items/${id}`, toMenuItemPayload(values), { headers: restaurantHeaders(restaurantId) })).data;

export const deleteMenuItem = async (id: string, restaurantId?: string | null) => {
  await api.delete(`/menu-items/${id}`, { headers: restaurantHeaders(restaurantId) });
};
