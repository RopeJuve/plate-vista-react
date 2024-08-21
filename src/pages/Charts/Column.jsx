import React from 'react'
import Header from '../../components/AdminComponents/Header';
import ColumnChart from '../../components/AdminComponents/Charts/ColumnChart';

const Column = () => (
    <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <div className="w-full">
          <ColumnChart />
        </div>
      </div>
    );

export default Column
