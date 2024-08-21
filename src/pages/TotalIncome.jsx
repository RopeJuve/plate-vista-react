import React from 'react'

import Line from './Charts/Line';
import Header from '../components/AdminComponents/Header';

const TotalIncome = () => (
  <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
    <Header category="Chart" title="Total Income" />
    <div className="w-full">
      <Line />
    </div>
  </div>
);

export default TotalIncome