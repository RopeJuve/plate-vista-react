import { useState, useEffect } from "react";
import api from "../services/api";
import { fetchAllOrders } from "../services/orderDataFetch";
import { notify } from "./notify";
import { ChartPoint, ChartSeries } from "../types";

const asArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  if (Array.isArray(data?.sales)) {
    return data.sales;
  }
  if (Array.isArray(data?.orders)) {
    return data.orders;
  }
  if (Array.isArray(data?.items)) {
    return data.items;
  }
  return [];
};

const toChartPoint = (item): ChartPoint | null => {
  const date = new Date(item.date || item.day || item.x || item.createdAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return {
    x: date,
    y: Number(item.total ?? item.amount ?? item.count ?? item.y ?? item.quantity ?? 0),
  };
};

const buildSeriesFromOrders = (orders): ChartSeries[] => {
  const grouped: Record<string, ChartPoint[]> = {};
  orders.forEach((order) => {
    (order.menuItems || []).forEach((item) => {
      const createdAt = new Date(order.createdAt);
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
  const [totalIncome, setTotalIncome] = useState("0");

  useEffect(() => {
    const load = async () => {
      try {
        const [salesRes, byDateRes] = await Promise.all([
          api.get("/statistics/sales"),
          api.get("/statistics/orders/by-date"),
        ]);

        const sales = salesRes.data;
        const income =
          sales?.total ??
          sales?.totalIncome ??
          asArray(sales).reduce((acc, item) => acc + Number(item.total ?? item.amount ?? 0), 0);
        setTotalIncome(Number(income).toFixed(2));

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
        const income = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
        setTotalIncome(income.toFixed(2));
        setLineChartData(buildSeriesFromOrders(orders));
      } catch (error) {
        notify(error.response?.data?.message || "Could not load chart data");
      }
    };

    load();
  }, []);

  return { lineChartData, totalIncome };
};
