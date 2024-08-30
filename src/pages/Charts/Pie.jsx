import React from 'react'

import Header from '../../Components/AdminComponents/Header';
import PieChart from '../../Components/AdminComponents/Charts/PieChart';

import { pieChartData } from '../../data/data';

const Pie = () => (
    <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header />
      <div className="w-full">
        <PieChart id="chart-pie" data={pieChartData} legendVisiblity height="full" />
      </div>
    </div>
  );

export default Pie
