import { useState, useEffect } from "react";
import api from "../services/api";
import { fetchAllOrders } from "../services/orderDataFetch";
import { notify, apiMessage } from "./notify";
import { ChartPoint, ChartSeries } from "../types";
import { readCents } from "../shared/money/formatCents";

type ChartOrder = {
  createdAt?: string;
  totalCents?: number;
  totalPrice?: number;
  menuItems?: unknown[];
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const asArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }
  const record = asRecord(data);
  if (!record) {
    return [];
  }
  for (const key of ["data", "sales", "orders", "items"] as const) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }
  return [];
};

const toChartPoint = (item: unknown): ChartPoint | null => {
  const record = asRecord(item);
  if (!record) {
    return null;
  }
  const date = new Date(
    String(record.date || record.day || record.x || record.createdAt || "")
  );
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return {
    x: date,
    y: Number(record.total ?? record.amount ?? record.count ?? record.y ?? record.quantity ?? 0),
  };
};

const buildSeriesFromOrders = (orders: ChartOrder[]): ChartSeries[] => {
  const grouped: Record<string, ChartPoint[]> = {};
  orders.forEach((order) => {
    (order.menuItems || []).forEach((raw) => {
      const item =
        raw && typeof raw === "object"
          ? (raw as { quantity?: number; product?: { category?: string } })
          : null;
      if (!item) {
        return;
      }
      const createdAt = new Date(order.createdAt || "");
      if (Number.isNaN(createdAt.getTime())) {
        return;
      }
      const category = item?.product?.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        x: createdAt,
        y: Number(item.quantity || 0),
      });
    });
  });

  return Object.keys(grouped).map((category) => ({
    name: category,
    dataSource: grouped[category].sort(
      (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime()
    ),
  }));
};

export const useFetchOrdersForCharts = () => {
  const [lineChartData, setLineChartData] = useState<ChartSeries[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [salesRes, byDateRes] = await Promise.all([
          api.get("/statistics/sales"),
          api.get("/statistics/orders/by-date"),
        ]);

        const sales = salesRes.data as { totalCents?: number; total?: number; totalIncome?: number };
        const income = readCents(sales?.totalCents, sales?.total ?? sales?.totalIncome);
        setTotalIncome(income);

        const datePoints = asArray(byDateRes.data)
          .map(toChartPoint)
          .filter((point): point is ChartPoint => point !== null);
        if (datePoints.length) {
          setLineChartData([{ name: "Orders", dataSource: datePoints }]);
          return;
        }
      } catch {
        // Fall back to paged orders if statistics are unavailable.
      }

      try {
        const { orders } = await fetchAllOrders();
        const income = orders.reduce(
          (acc, order) => acc + readCents(order.totalCents, order.totalPrice),
          0
        );
        setTotalIncome(income);
        setLineChartData(buildSeriesFromOrders(orders));
      } catch (error: unknown) {
        notify(apiMessage(error, "Could not load chart data"));
      }
    };

    load();
  }, []);

  return { lineChartData, totalIncome };
};
