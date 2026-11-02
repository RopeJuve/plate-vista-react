import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import type { MenuItemValues } from "../../../lib/schemas";
import type { MenuItem } from "../../../types";
import { apiMessage, notify } from "../../../utils/notify";
import { fetchCategoryList, type Category } from "../categoriesApi";
import { createMenuItem, deleteMenuItem, fetchMenuItemList, updateMenuItem } from "../menuItemsApi";

/**
 * The restaurant's menu for the admin, with its categories. Every change
 * reports its own errors and resolves false when nothing changed.
 */
export const useMenuItems = () => {
  const { restaurantId } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchMenuItemList(restaurantId)
      .then(setMenuItems)
      .catch((error) => notify(apiMessage(error, "Could not load menu items")));
    fetchCategoryList()
      .then(setCategories)
      .catch((error) => notify(apiMessage(error, "Could not load categories")));
  }, [restaurantId]);

  const settle = async (change: () => Promise<void>, success: string, fallback: string) => {
    try {
      await change();
      notify(success, "success");
      return true;
    } catch (error) {
      notify(apiMessage(error, fallback));
      return false;
    }
  };

  const addItem = (values: MenuItemValues) =>
    settle(
      async () => {
        const created = await createMenuItem(values, restaurantId);
        setMenuItems((current) => [...current, created]);
      },
      "Menu item added",
      "Could not add menu item"
    );

  const saveItem = (id: string, values: MenuItemValues) =>
    settle(
      async () => {
        const saved = await updateMenuItem(id, values, restaurantId);
        setMenuItems((current) => current.map((item) => (item._id === id ? saved : item)));
      },
      "Menu item updated",
      "Could not save menu item"
    );

  const removeItem = (id: string) =>
    settle(
      async () => {
        await deleteMenuItem(id, restaurantId);
        setMenuItems((current) => current.filter((item) => item._id !== id));
      },
      "Menu item deleted",
      "Could not delete menu item"
    );

  return { menuItems, categories, addItem, saveItem, removeItem };
};
