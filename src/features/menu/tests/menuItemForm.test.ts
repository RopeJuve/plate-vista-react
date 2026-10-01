import { describe, expect, it } from "vitest";
import type { MenuItem } from "../../../types";
import { categoriesInUse, itemsInCategory, toFormValues, toMenuItemList } from "../menuItemForm";

const soup: MenuItem = { _id: "m1", title: "Soup", price: "4.5", categoryId: "c1" };
const wine: MenuItem = { _id: "m2", title: "Wine", price: 7, categoryId: "c2", inStock: false, popular: true };
const starters = { _id: "c1", name: "Starters", station: "kitchen" as const, position: 0 };
const desserts = { _id: "c3", name: "Desserts", station: "kitchen" as const, position: 2 };

describe("menu item form", () => {
  it("starts the edit form from the item, reading missing flags as in stock and not popular", () => {
    expect(toFormValues(soup)).toEqual({
      title: "Soup",
      price: 4.5,
      categoryId: "c1",
      description: "",
      image: null,
      popular: false,
      inStock: true,
    });
    expect(toFormValues(wine)).toMatchObject({ inStock: false, popular: true });
  });

  it("reads the menu list, dropping entries without an id", () => {
    expect(toMenuItemList({ items: [{ id: "m9", title: "Tea" }, { title: "No id" }, null] })).toEqual([
      { id: "m9", _id: "m9", title: "Tea" },
    ]);
  });

  it("offers only categories that have dishes, and filters by one", () => {
    expect(categoriesInUse([starters, desserts], [soup, wine])).toEqual([starters]);
    expect(itemsInCategory([soup, wine], "c2")).toEqual([wine]);
    expect(itemsInCategory([soup, wine], "")).toEqual([soup, wine]);
  });
});
