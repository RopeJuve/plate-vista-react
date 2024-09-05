import React from 'react';
import LineChart from '../../components/AdminComponents/Charts/LineChart';

const Line = ({ data }) => (
  <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
    <div className="w-full">
      <LineChart data={data} />
    </div>
  </div>
);

export default Line;
