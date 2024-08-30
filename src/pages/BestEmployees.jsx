import React from 'react'

import Bar from '../pages/Charts/Bar';
import Header from '../Components/AdminComponents/Header';

const BestEmployees = () => (
  <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-d-main-bg rounded-3xl shadow-lg transition-colors duration-300 ease-in-out">
    <Header title="Best Employees" />
    <div className="w-full mt-8">
      <Bar />
    </div>
  </div>
);

export default BestEmployees;
