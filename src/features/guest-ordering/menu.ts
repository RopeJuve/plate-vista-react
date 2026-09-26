import type { MenuUpdatedData, Station } from "../../shared/realtime/protocol";
import { eurosToCents } from "../../shared/money/formatCents";

export type MenuRecord = {
  _id: string;
  title: string;
  description: string;
  priceCents: number;
  image: string;
  category: string;
  inStock: boolean;
  station: Station;
  popular: boolean;
  archived: boolean;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

export const unwrapList = (data: unknown): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }
  const record = asRecord(data);
  if (!record) {
    return [];
  }
  for (const key of ["items", "menuItems", "data", "tables", "orders"]) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }
  return [];
};

export const toMenuRecord = (raw: unknown): MenuRecord | null => {
  const record = asRecord(raw);
  if (!record || typeof record._id !== "string") {
    return null;
  }
  const priceCents =
    typeof record.priceCents === "number"
      ? Math.round(record.priceCents)
      : eurosToCents(
          typeof record.price === "number" || typeof record.price === "string" ? record.price : 0
        );
  return {
    _id: record._id,
    title: typeof record.title === "string" ? record.title : "",
    description: typeof record.description === "string" ? record.description : "",
    priceCents,
    image: typeof record.image === "string" ? record.image : "",
    category: typeof record.category === "string" ? record.category : "",
    inStock: record.inStock !== false,
    station: record.station === "bar" ? "bar" : "kitchen",
    popular: Boolean(record.popular),
    archived: Boolean(record.archived),
  };
};

export const applyMenuUpdate = (items: MenuRecord[], update: MenuUpdatedData): MenuRecord[] => {
  const index = items.findIndex((item) => item._id === update._id);
  if (index === -1) {
    return [
      ...items,
      {
        _id: update._id,
        title: update.title,
        description: "",
        priceCents: update.priceCents,
        image: "",
        category: update.category,
        inStock: update.inStock,
        station: "kitchen",
        popular: false,
        archived: update.archived,
      },
    ];
  }
  const current = items[index];
  const next = items.slice();
  next[index] = {
    ...current,
    title: update.title,
    priceCents: update.priceCents,
    inStock: update.inStock,
    category: update.category,
    archived: update.archived,
  };
  return next;
};
