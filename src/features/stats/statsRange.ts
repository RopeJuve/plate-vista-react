import {
  addDays,
  addMonths,
  format,
  isAfter,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";

export type StatsRange = "7d" | "30d" | "12m" | "all";
export type GroupBy = "day" | "month";

export const STATS_RANGES: { value: StatsRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "12m", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

export const rangeLabel = (range: StatsRange) =>
  STATS_RANGES.find((option) => option.value === range)?.label ?? "";

type RangeQuery = {
  params: { start_date?: string; end_date?: string };
  groupBy: GroupBy;
  start: Date | null;
};

// The API filters by [start_date, end_date]; "all" sends neither.
export const rangeQuery = (range: StatsRange, now = new Date()): RangeQuery => {
  const between = (start: Date, groupBy: GroupBy): RangeQuery => ({
    params: { start_date: start.toISOString(), end_date: now.toISOString() },
    groupBy,
    start,
  });
  if (range === "7d") return between(startOfDay(subDays(now, 6)), "day");
  if (range === "30d") return between(startOfDay(subDays(now, 29)), "day");
  if (range === "12m") return between(startOfMonth(subMonths(now, 11)), "month");
  return { params: {}, groupBy: "month", start: null };
};

const KEY_FORMAT: Record<GroupBy, string> = { day: "yyyy-MM-dd", month: "yyyy-MM" };

export type DateRow = { date: string; ordersCount: number; totalCents: number };

// The API only returns days that had orders. A chart needs the quiet days too,
// or the line jumps straight across them.
export const fillDates = (
  rows: DateRow[],
  range: StatsRange,
  now = new Date()
): DateRow[] => {
  const { groupBy, start } = rangeQuery(range, now);
  const byKey = new Map(rows.map((row) => [row.date, row]));
  const first = start ?? (rows.length ? parseISO(rows[0].date) : null);
  if (!first) return [];
  const step = groupBy === "day" ? addDays : addMonths;
  const last = groupBy === "day" ? startOfDay(now) : startOfMonth(now);
  const filled: DateRow[] = [];
  for (let cursor = first; !isAfter(cursor, last); cursor = step(cursor, 1)) {
    const key = format(cursor, KEY_FORMAT[groupBy]);
    filled.push(byKey.get(key) ?? { date: key, ordersCount: 0, totalCents: 0 });
  }
  return filled;
};

// "2026-09-29" and "2026-09" as local dates (Date("2026-09-29") would be UTC).
export const dateOfKey = (key: string) => parseISO(key);

// Monthly ranges label their points by month, daily ones by day.
export const xFormatFor = (range: StatsRange) =>
  rangeQuery(range).groupBy === "month" ? "MMM yy" : "d MMM";

export type CategoryRow = { date: string; category: string; numSold: number; totalCents: number };

export type CategoryChart = {
  // Chart keys are c0, c1… because category names may not be valid CSS names.
  categories: { key: string; label: string }[];
  rows: Record<string, string | number>[];
};

// One row per day (or month) with the items sold in each category.
export const pivotCategories = (
  rows: CategoryRow[],
  range: StatsRange,
  now = new Date()
): CategoryChart => {
  const labels = [...new Set(rows.map((row) => row.category))].sort();
  const categories = labels.map((label, index) => ({ key: `c${index}`, label }));
  const keyOf = new Map(categories.map((category) => [category.label, category.key]));
  const dates = [...new Set(rows.map((row) => row.date))]
    .sort()
    .map((date) => ({ date, ordersCount: 0, totalCents: 0 }));
  const chartRows = fillDates(dates, range, now).map(({ date }) => {
    const row: Record<string, string | number> = { date };
    categories.forEach((category) => {
      row[category.key] = 0;
    });
    return row;
  });
  const rowOf = new Map(chartRows.map((row) => [row.date, row]));
  rows.forEach((sale) => {
    const row = rowOf.get(sale.date);
    const key = keyOf.get(sale.category);
    if (row && key) row[key] = Number(row[key]) + sale.numSold;
  });
  return { categories, rows: chartRows };
};
