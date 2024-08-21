import React from 'react'

import Bar from '../pages/Charts/Bar';
import Header from '../components/AdminComponents/Header';

const BestEmployees = () => (
  <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
    <Header />
    <div className="w-full">
      <Bar />
    </div>
  </div>
);

export default BestEmployees;
