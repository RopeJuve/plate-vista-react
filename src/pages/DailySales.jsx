import React from 'react';
import Line from './Charts/Line';
import Header from '../Components/AdminComponents/Header';
import { useFetchOrdersForCharts } from "../utils/fetchOrdersForCharts";

const DailySales = () => {
  const { lineChartData } = useFetchOrdersForCharts();

  return (
    <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-d-main-bg rounded-3xl shadow-lg transition-colors duration-300 ease-in-out">
      <Header title="Daily Sales" />
      <div className="w-full mt-8">
        <Line data={lineChartData} />
      </div>
    </div>
  );
};

export default DailySales;
