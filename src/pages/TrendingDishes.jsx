import React from 'react'

import Pie from '../pages/Charts/Pie';
import Header from '../components/AdminComponents/Header';

const TrendingDishes = () => (
  <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
    <Header />
    <div className="w-full">
      <Pie />
    </div>
  </div>
);

export default TrendingDishes
