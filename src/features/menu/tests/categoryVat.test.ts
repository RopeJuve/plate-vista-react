import { describe, expect, it } from "vitest";
import type { Category } from "../categoriesApi";
import { categoryFieldError, defaultVatRate, vatBadge, vatRateOf } from "../categoryVat";

const categories: Category[] = [
  { _id: "cat-mains", name: "Mains", station: "kitchen", position: 0, vatRate: "REDUCED_1" },
  { _id: "cat-drinks", name: "Drinks", station: "bar", position: 1, vatRate: "NORMAL" },
];

const axiosError = (status: number, data: unknown) => ({ response: { status, data } });

describe("defaultVatRate", () => {
  it("puts bar categories on 19 % and kitchen categories on 7 %", () => {
    expect(defaultVatRate("bar")).toBe("NORMAL");
    expect(defaultVatRate("kitchen")).toBe("REDUCED_1");
  });
});

describe("vatBadge", () => {
  it("prints the rate as a percentage", () => {
    expect(vatBadge("REDUCED_1")).toBe("7 %");
    expect(vatBadge("NORMAL")).toBe("19 %");
  });
});

describe("vatRateOf", () => {
  it("takes the rate from the item's category", () => {
    expect(vatRateOf(categories, "cat-drinks")).toBe("NORMAL");
    expect(vatRateOf(categories, "cat-mains")).toBe("REDUCED_1");
  });

  it("knows no rate for an item without a known category", () => {
    expect(vatRateOf(categories, undefined)).toBeUndefined();
    expect(vatRateOf(categories, "cat-gone")).toBeUndefined();
  });
});

describe("categoryFieldError", () => {
  it("puts a validation error on the field the server names", () => {
    const error = axiosError(400, { code: "VALIDATION", details: { fields: { vatRate: "Unknown VAT rate" } } });
    expect(categoryFieldError(error)).toEqual({ field: "vatRate", message: "Unknown VAT rate" });
  });

  it("reads a field without a message as a readable default", () => {
    const error = axiosError(400, { code: "VALIDATION", details: { fields: { vatRate: "" } } });
    expect(categoryFieldError(error)).toEqual({ field: "vatRate", message: "Pick a VAT rate" });
  });

  it("names no field when the server names none it knows", () => {
    expect(categoryFieldError(axiosError(400, { message: "Name taken" }))).toBeNull();
    expect(categoryFieldError(axiosError(400, { details: { fields: { colour: "?" } } }))).toBeNull();
    expect(categoryFieldError(new Error("Network Error"))).toBeNull();
  });
});
