import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import type { ChartSeries } from "../../../types";
import { centsToEurosForChart } from "../../../shared/money/formatCents";
import {
  dateOfKey,
  fillDates,
  rangeQuery,
  type CategoryRow,
  type DateRow,
  type StatsRange,
} from "../statsRange";

export type StatsSummary = {
  ordersCount: number;
  totalCents: number;
  averageOrderCents: number;
  itemsSold: number;
  topItem: { menu_item: string; numSold: number; totalCents: number } | null;
};

export type MenuItemSales = { menu_item: string; numSold: number; totalCents: number };

const EMPTY_SUMMARY: StatsSummary = {
  ordersCount: 0,
  totalCents: 0,
  averageOrderCents: 0,
  itemsSold: 0,
  topItem: null,
};

// Loads one statistics endpoint for the range and reloads when it changes.
// A failed request shows its toast (from the API client) and keeps the fallback.
const useStatsQuery = <T,>(path: string, range: StatsRange, fallback: T, extra?: Record<string, string>) => {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const extraKey = JSON.stringify(extra ?? {});

  useEffect(() => {
    let cancelled = false;
    const { params, groupBy } = rangeQuery(range);
    setLoading(true);
    api
      .get(`/statistics${path}`, { params: { ...params, group_by: groupBy, ...JSON.parse(extraKey) } })
      .then((response) => {
        if (!cancelled) setData(response.data as T);
      })
      .catch(() => {
        if (!cancelled) setData(fallback);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // fallback is a constant per call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, range, extraKey]);

  return { data, loading };
};

export const useSummary = (range: StatsRange) => useStatsQuery("/summary", range, EMPTY_SUMMARY);

const NO_ROWS: never[] = [];

// Orders and revenue per day (or month), with quiet days filled in.
export const useSalesByDate = (range: StatsRange) => {
  const { data, loading } = useStatsQuery<DateRow[]>("/orders/by-date", range, NO_ROWS);
  const series = useMemo(() => {
    const rows = fillDates(Array.isArray(data) ? data : [], range);
    const hasSales = rows.some((row) => row.ordersCount > 0);
    const toSeries = (name: string, value: (row: DateRow) => number): ChartSeries[] =>
      hasSales ? [{ name, dataSource: rows.map((row) => ({ x: dateOfKey(row.date), y: value(row) })) }] : [];
    return {
      orders: toSeries("Orders", (row) => row.ordersCount),
      revenue: toSeries("Revenue (€)", (row) => centsToEurosForChart(row.totalCents)),
    };
  }, [data, range]);
  return { ...series, loading };
};

export const useTopDishes = (range: StatsRange, limit = 6) =>
  useStatsQuery<MenuItemSales[]>("/sales/menu-items", range, NO_ROWS, { limit: String(limit) });

export const useSalesByCategory = (range: StatsRange) =>
  useStatsQuery<CategoryRow[]>("/sales/categories", range, NO_ROWS);
