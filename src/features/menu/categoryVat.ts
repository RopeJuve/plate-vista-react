import type { VatRate } from "../../shared/api/payments";
import type { Category, Station } from "./categoriesApi";

/** The two German VAT rates a menu category can be on, as the owner picks them. */
export const VAT_RATE_OPTIONS: { value: VatRate; label: string }[] = [
  { value: "REDUCED_1", label: "Food, 7 %" },
  { value: "NORMAL", label: "Drinks, 19 %" },
];

const VAT_BADGE: Record<VatRate, string> = { REDUCED_1: "7 %", NORMAL: "19 %" };

/** A new category's rate until the owner picks one: drinks from the bar, food from the kitchen. */
export const defaultVatRate = (station: Station): VatRate => (station === "bar" ? "NORMAL" : "REDUCED_1");

export const vatBadge = (rate: VatRate) => VAT_BADGE[rate];

/** A menu item's rate is its category's. */
export const vatRateOf = (categories: Category[], categoryId?: string): VatRate | undefined =>
  categories.find((category) => category._id === categoryId)?.vatRate;

export type CategoryField = "name" | "station" | "vatRate";

const FIELD_DEFAULTS: Record<CategoryField, string> = {
  name: "Check the name",
  station: "Pick a station",
  vatRate: "Pick a VAT rate",
};

const isField = (key: string): key is CategoryField => key in FIELD_DEFAULTS;

const validationFields = (error: unknown): Record<string, unknown> | undefined => {
  const data = (error as { response?: { data?: { details?: { fields?: unknown } } } } | null)?.response?.data;
  const fields = data?.details?.fields;
  return fields && typeof fields === "object" ? (fields as Record<string, unknown>) : undefined;
};

export type CategoryFieldError = { field: CategoryField; message: string };

/** The field a 400 VALIDATION answer names, with a readable message; null when it names none we show. */
export const categoryFieldError = (error: unknown): CategoryFieldError | null => {
  const fields = validationFields(error);
  const field = Object.keys(fields ?? {}).find(isField);
  if (!fields || !field) {
    return null;
  }
  const message = fields[field];
  return { field, message: typeof message === "string" && message ? message : FIELD_DEFAULTS[field] };
};
