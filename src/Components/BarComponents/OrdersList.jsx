import React from 'react'
import BarOrders from './BarOrders'

const OrdersList = () => {
  return (
    <div className='grid grid-cols-3 gap-4 md:h-screen'>
        <BarOrders title='New Orders'/>
        <BarOrders title='Accepted'/>
        <BarOrders title='Completed'/>
    </div>
  )
}

export default OrdersList