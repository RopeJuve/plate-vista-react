import { describe, expect, it } from "vitest";
import { toCategoryList, toMenuRecord, unwrapList, visibleMenuItems, type MenuRecord } from "../menu";

const dish = (title: string, category: string, overrides: Partial<MenuRecord> = {}): MenuRecord => ({
  _id: title,
  title,
  description: "",
  priceCents: 450,
  image: "",
  category,
  inStock: true,
  station: "kitchen",
  popular: false,
  archived: false,
  ...overrides,
});

describe("visibleMenuItems", () => {
  const soup = dish("Tomato soup", "starters", { description: "with basil" });
  const salad = dish("Salad", "starters", { archived: true });
  const wine = dish("Red wine", "drinks");

  it("shows the picked category, never archived dishes", () => {
    expect(visibleMenuItems([soup, salad, wine], "", "starters")).toEqual([soup]);
    expect(visibleMenuItems([soup, salad, wine], "", "")).toEqual([soup, wine]);
  });

  it("searches every category by title or description, ignoring case and spaces", () => {
    expect(visibleMenuItems([soup, salad, wine], "  BASIL ", "drinks")).toEqual([soup]);
    expect(visibleMenuItems([soup, salad, wine], "salad", "")).toEqual([]);
  });
});

describe("unwrapList", () => {
  it("returns arrays as-is", () => {
    expect(unwrapList([{ _id: "1" }])).toEqual([{ _id: "1" }]);
  });

  it("unwraps wrapped menu and category payloads", () => {
    expect(unwrapList({ items: [{ _id: "1" }] })).toEqual([{ _id: "1" }]);
    expect(unwrapList({ menuItems: [{ _id: "2" }] })).toEqual([{ _id: "2" }]);
    expect(unwrapList({ categories: ["beer", "pizza"] })).toEqual(["beer", "pizza"]);
    expect(unwrapList({ menu: [{ id: "3" }] })).toEqual([{ id: "3" }]);
    expect(unwrapList({ data: { menuItems: [{ _id: "4" }] } })).toEqual([{ _id: "4" }]);
  });

  it("returns an empty array for unknown shapes", () => {
    expect(unwrapList(null)).toEqual([]);
    expect(unwrapList({ total: 3 })).toEqual([]);
  });
});

describe("toCategoryList", () => {
  it("reads string categories and named category objects", () => {
    expect(toCategoryList(["beer", { name: "pizza" }, "wine"])).toEqual(["beer", "pizza", "wine"]);
    expect(toCategoryList({ categories: ["beer"] })).toEqual(["beer"]);
    expect(toCategoryList({ category: ["hot drinks", "wine"] })).toEqual(["hot drinks", "wine"]);
    expect(toCategoryList([{ category: "salads" }, { title: "desserts" }])).toEqual([
      "salads",
      "desserts",
    ]);
  });
});

describe("toMenuRecord", () => {
  it("accepts id as well as _id", () => {
    const fromId = toMenuRecord({ id: "item-1", title: "Lager", priceCents: 450, category: "beer" });
    expect(fromId?._id).toBe("item-1");
    expect(fromId?.title).toBe("Lager");
  });
});
