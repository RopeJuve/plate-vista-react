import React from 'react'
import Stacked from '../components/AdminComponents/Charts/Stacked';
import Header from '../components/AdminComponents/Header';

const TotalOrders = () => {
  return (
    <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
    <Header />
    <div className="w-full">
      <Stacked />
    </div>
  </div>
  )
}

export default TotalOrders;