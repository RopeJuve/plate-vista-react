import { useEffect, useState } from "react";
import type { VatRate } from "../../../shared/api/payments";
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
import { categoryFieldError, type CategoryFieldError } from "../categoryVat";

const replaceCategory = (categories: Category[], updated: Category) =>
  categories.map((category) => (category._id === updated._id ? updated : category));

/**
 * The menu's categories in guest order, and every change to them. Changes
 * report their own errors and resolve false when nothing changed. Adding and
 * changing the VAT rate resolve to the error instead, because the form shows it under the field.
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

  const fieldError = (error: unknown, fallback: string): CategoryFieldError =>
    categoryFieldError(error) ?? { field: "name", message: apiMessage(error, fallback) };

  /** Resolves to the field error, or null once the category is added. */
  const addCategory = async (values: CategoryValues): Promise<CategoryFieldError | null> => {
    try {
      const created = await createCategory(values);
      setCategories((current) => [...current, created]);
      return null;
    } catch (error) {
      return fieldError(error, "Could not add the category");
    }
  };

  /** Resolves to a message for under the rate, or null once it is saved. */
  const changeVatRate = async (id: string, vatRate: VatRate): Promise<string | null> => {
    try {
      const updated = await updateCategory(id, { vatRate });
      setCategories((current) => replaceCategory(current, updated));
      return null;
    } catch (error) {
      return categoryFieldError(error)?.message ?? apiMessage(error, "Could not change the VAT rate");
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

  return { categories, addCategory, renameCategory, changeStation, changeVatRate, move, removeCategory };
};
