import React from 'react';

function OrderConfirmation({ orderDetails }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Order Confirmation</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-2">Thank you, {orderDetails.name}!</p>
      <p className="text-gray-700 dark:text-gray-300 mb-4">Your order has been placed successfully.</p>
      <div className="mb-4">
        <h3 className="font-bold">Order Summary:</h3>
        <ul>
          {orderDetails.items.map((item, index) => (
            <li key={index} className="flex justify-between mb-2">
              <span>{item.title}</span>
              <span>{item.price}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between font-bold text-lg mb-4">
        <span>Total</span>
        <span>${orderDetails.totalPrice.toFixed(2)}</span>
      </div>
      <p className="text-gray-700 dark:text-gray-300">Your order will be shipped to:</p>
      <p className="text-gray-700 dark:text-gray-300">{orderDetails.address}</p>
    </div>
  );
}

export default OrderConfirmation;
