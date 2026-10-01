import { useEffect, useState } from "react";
import type { CategoryValues } from "../../../lib/schemas";
import { apiMessage, notify } from "../../../utils/notify";
import {
  createCategory,
  deleteCategory,
  fetchCategoryList,
  moveCategory,
  updateCategory,
  type Category,
  type Station,
} from "../categoriesApi";

const replaceCategory = (categories: Category[], updated: Category) =>
  categories.map((category) => (category._id === updated._id ? updated : category));

/**
 * The menu's categories in guest order, and every change to them. Changes
 * report their own errors and resolve false when nothing changed. Adding
 * resolves to the error instead, because the form shows it under the field.
 */
export const useCategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategoryList()
      .then(setCategories)
      .catch((error) => notify(apiMessage(error, "Could not load categories")));
  }, []);

  const settle = async (change: () => Promise<void>, fallback: string) => {
    try {
      await change();
      return true;
    } catch (error) {
      notify(apiMessage(error, fallback));
      return false;
    }
  };

  /** Resolves to an error message, or null once the category is added. */
  const addCategory = async (values: CategoryValues): Promise<string | null> => {
    try {
      const created = await createCategory(values);
      setCategories((current) => [...current, created]);
      return null;
    } catch (error) {
      return apiMessage(error, "Could not add the category");
    }
  };

  const renameCategory = (id: string, name: string) =>
    settle(async () => {
      const updated = await updateCategory(id, { name });
      setCategories((current) => replaceCategory(current, updated));
    }, "Could not rename the category");

  const changeStation = (id: string, station: Station) =>
    settle(async () => {
      const updated = await updateCategory(id, { station });
      setCategories((current) => replaceCategory(current, updated));
    }, "Could not change the station");

  const move = (id: string, direction: "up" | "down") =>
    settle(async () => setCategories(await moveCategory(id, direction)), "Could not move it");

  const removeCategory = (id: string) =>
    settle(async () => {
      await deleteCategory(id);
      setCategories((current) => current.filter((category) => category._id !== id));
    }, "Could not delete the category");

  return { categories, addCategory, renameCategory, changeStation, move, removeCategory };
};
