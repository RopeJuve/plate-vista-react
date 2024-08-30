import React from 'react'
import Pie from '../pages/Charts/Pie';
import Header from '../Components/AdminComponents/Header';

const TrendingDishes = () => (
  <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-d-main-bg rounded-3xl shadow-lg transition-colors duration-300 ease-in-out">
    <Header title="Trending Dishes"/>
    <div className="w-full mt-8">
      <Pie />
    </div>
  </div>
);

export default TrendingDishes;