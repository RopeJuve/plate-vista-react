import type { Category } from "../../features/menu/categoriesApi";

/** Food on the reduced rate, drinks on the normal rate: both VAT rates in one list. */
export const categories: Category[] = [
  { _id: "cat-starters", name: "Starters", station: "kitchen", position: 0, vatRate: "REDUCED_1" },
  { _id: "cat-mains", name: "Mains", station: "kitchen", position: 1, vatRate: "REDUCED_1" },
  { _id: "cat-drinks", name: "Drinks", station: "bar", position: 2, vatRate: "NORMAL" },
];
