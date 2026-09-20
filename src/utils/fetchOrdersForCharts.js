import { useState, useEffect } from "react";
import api from "../services/api";
import { fetchAllOrders } from "../services/orderDataFetch";
import { notify } from "./notify";

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

const toChartPoint = (item) => ({
  x: new Date(item.date || item.day || item.x || item.createdAt),
  y: Number(item.total ?? item.amount ?? item.count ?? item.y ?? item.quantity ?? 0),
});

const buildSeriesFromOrders = (orders) => {
  const grouped = {};
  orders.forEach((order) => {
    (order.menuItems || []).forEach((item) => {
      const category = item?.product?.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        x: new Date(order.createdAt),
        y: Number(item.quantity || 0),
      });
    });
  });

  return Object.keys(grouped).map((category) => ({
    name: category,
    dataSource: grouped[category].sort((a, b) => new Date(a.x) - new Date(b.x)),
  }));
};

export const useFetchOrdersForCharts = () => {
  const [lineChartData, setLineChartData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

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

        const datePoints = asArray(byDateRes.data).map(toChartPoint);
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
