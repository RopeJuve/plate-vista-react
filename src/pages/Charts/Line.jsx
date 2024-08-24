import React from 'react'
import Header from '../../components/AdminComponents/Header';
import LineChart from '../../components/AdminComponents/Charts/LineChart';


const Line = () => (
<div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
    <div className="w-full">
      <LineChart />
    </div>
  </div>
);


export default Line;