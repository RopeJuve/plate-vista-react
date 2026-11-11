import type { MenuItemPayload, MenuItemValues } from "../../lib/schemas";
import { centsToEuros, eurosToCents } from "../../shared/money/formatCents";
import type { MenuItem } from "../../types";
import { readItemId, unwrapList } from "../guest-ordering/menu";
import type { Category } from "./categoriesApi";

/** A blank menu item form. Price starts empty, not 0, so the admin has to type one. */
export const EMPTY_MENU_ITEM: MenuItemValues = {
  title: "",
  priceEuros: undefined as unknown as number,
  categoryId: "",
  description: "",
  image: null,
  popular: false,
  inStock: true,
};

/** A menu item as the edit form starts it. Missing flags read as "in stock" and "not popular". */
export const toFormValues = (item: MenuItem): MenuItemValues => ({
  title: item.title || "",
  priceEuros: item.priceCents ? centsToEuros(item.priceCents) : (undefined as unknown as number),
  categoryId: item.categoryId || "",
  description: item.description || "",
  image: item.image || null,
  popular: Boolean(item.popular),
  inStock: item.inStock !== false,
});

/** The form values as the API takes them: the euro price becomes `priceCents`. */
export const toMenuItemPayload = ({ priceEuros, ...values }: MenuItemValues): MenuItemPayload => ({
  ...values,
  priceCents: eurosToCents(priceEuros),
});

/** `GET /menu-items` as admin menu items, dropping anything without an id. */
export const toMenuItemList = (data: unknown): MenuItem[] =>
  unwrapList(data).flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const record = item as Record<string, unknown> & MenuItem;
    const id = readItemId(record);
    return id ? [{ ...record, _id: id }] : [];
  });

/** Filter tabs for the menu: categories that have items, in menu order. */
export const categoriesInUse = (categories: Category[], items: MenuItem[]): Category[] =>
  categories.filter((category) => items.some((item) => item.categoryId === category._id));

/** Items in one category; every item when no category is picked. */
export const itemsInCategory = (items: MenuItem[], categoryId: string): MenuItem[] =>
  categoryId ? items.filter((item) => item.categoryId === categoryId) : items;
