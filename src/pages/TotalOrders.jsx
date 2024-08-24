import React from 'react'
import Stacked from '../components/AdminComponents/Charts/Stacked';
import Header from '../components/AdminComponents/Header';

const TotalOrders = () => {
  return (
    <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-d-main-bg rounded-3xl shadow-lg transition-colors duration-300 ease-in-out">
    <Header title="Total Orders"/>
    <div className="w-full mt-8">
      <Stacked />
    </div>
  </div>
  )
}

export default TotalOrders;