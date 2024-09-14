import { useState, useEffect } from 'react';
import { fetchOrders } from "../services/orderDataFetch";
import { chartData, categorizedData } from "../data/data";

export const useFetchOrdersForCharts = () => {
  const [lineChartData, setLineChartData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    fetchOrders()
      .then(response => {
        const orders = response.data;

        // This is for my total income
        const income = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
        setTotalIncome(income.toFixed(2));

        Object.keys(categorizedData).forEach(category => {
          categorizedData[category] = [];
        });

       
        orders.forEach(order => {
          order.menuItems.forEach(item => {
            const category = item?.product?.category?.toLowerCase() || '';
            const date = new Date(order.createdAt);

            if (["beer", "wine"].includes(category)) {
              categorizedData["Alcoholic Beverages"].push({ x: date, y: item.quantity });
            } else if (["hot drinks", "cold drinks"].includes(category)) {
              categorizedData["Non-Alcoholic Beverages"].push({ x: date, y: item.quantity });
            } else if (["pizza", "burgers"].includes(category)) {
              categorizedData["Main Course"].push({ x: date, y: item.quantity });
            } else if (category === "salads") {
              categorizedData.Salads.push({ x: date, y: item.quantity });
            } else if (category === "desserts") {
              categorizedData.Desserts.push({ x: date, y: item.quantity });
            }
          });
        });

        const sortedData = Object.keys(categorizedData).map(category => ({
          name: category,
          dataSource: categorizedData[category].sort((a, b) => new Date(a.x) - new Date(b.x))
        }));

        setLineChartData(sortedData);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
      });
  }, []);

  return { lineChartData, totalIncome };
};
