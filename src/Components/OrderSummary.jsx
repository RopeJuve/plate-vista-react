import React from "react";
import { useCart } from "../CartContext";

function OrderSummary() {
  const { cartItems } = useCart();

  // Calculate the total price
  const totalPrice = cartItems.reduce((total, item) => {
    const priceNumber = parseFloat(item.price.replace("$", ""));
    return total + priceNumber;
  }, 0);

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
      <ul className="mb-4">
        {cartItems.map((item, index) => (
          <li key={index} className="flex justify-between mb-2">
            <span>{item.title}</span>
            <span>{item.price}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-bold text-lg mb-4">
        <span>Total</span>
        <span>${totalPrice.toFixed(2)}</span>
      </div>
      {/* No button here */}
    </div>
  );
}

export default OrderSummary;
