import React, { useState } from "react";
import { useCart } from "../CartContext";

function Checkout({ onSubmit }) {
  const { cartItems } = useCart();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  // Calculate the total price
  const totalPrice = cartItems.reduce((total, item) => {
    const priceNumber = parseFloat(item.price.replace("$", ""));
    return total + priceNumber;
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderDetails = {
      name,
      address,
      cardNumber,
      totalPrice,
      items: cartItems,
    };
    onSubmit(orderDetails); // Pass the order details to the parent component
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Checkout
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Card Number
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded w-full"
        >
          Place Order
        </button>
      </form>
    </div>
  );
}

export default Checkout;
