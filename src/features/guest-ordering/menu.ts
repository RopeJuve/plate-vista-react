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

export const readItemId = (record: Record<string, unknown>): string | null => {
  const raw = record._id ?? record.id;
  if (typeof raw === "string" && raw) {
    return raw;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return String(raw);
  }
  if (raw && typeof raw === "object" && "$oid" in raw) {
    const oid = (raw as { $oid?: unknown }).$oid;
    if (typeof oid === "string" && oid) {
      return oid;
    }
  }
  return null;
};

const DEFAULT_LIST_KEYS = [
  "items",
  "menuItems",
  "menu",
  "products",
  "results",
  "data",
  "tables",
  "orders",
  "categories",
];

export const unwrapList = (data: unknown, keys: string[] = DEFAULT_LIST_KEYS): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }
  const record = asRecord(data);
  if (!record) {
    return [];
  }
  for (const key of keys) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }
  const nested = asRecord(record.data);
  if (nested) {
    for (const key of keys) {
      if (key === "data") {
        continue;
      }
      if (Array.isArray(nested[key])) {
        return nested[key] as unknown[];
      }
    }
  }
  return [];
};

const CATEGORY_LIST_KEYS = ["categories", "category", ...DEFAULT_LIST_KEYS];

const readCategoryName = (item: unknown): string | null => {
  if (typeof item === "string") {
    const name = item.trim();
    return name || null;
  }
  const record = asRecord(item);
  if (!record) {
    return null;
  }
  for (const key of ["name", "category", "title", "label"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
};

export const toCategoryList = (data: unknown): string[] => {
  const names = unwrapList(data, CATEGORY_LIST_KEYS)
    .map(readCategoryName)
    .filter((name): name is string => Boolean(name));
  return [...new Set(names)];
};

export const toMenuRecord = (raw: unknown): MenuRecord | null => {
  const record = asRecord(raw);
  const id = record ? readItemId(record) : null;
  if (!record || !id) {
    return null;
  }
  const priceCents =
    typeof record.priceCents === "number"
      ? Math.round(record.priceCents)
      : eurosToCents(
          typeof record.price === "number" || typeof record.price === "string" ? record.price : 0
        );
  return {
    _id: id,
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
