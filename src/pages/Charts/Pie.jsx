import React from 'react'

import Header from '../../components/AdminComponents/Header';
import PieChart from '../../components/AdminComponents/Charts/PieChart';

import { pieChartData } from '../../data/data';

const Pie = () => (
    <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header title="Trending Dishes" />
      <div className="w-full">
        <PieChart id="chart-pie" data={pieChartData} legendVisiblity height="full" />
      </div>
    </div>
  );

export default Pie
