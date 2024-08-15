import React from "react";
import { useCart } from "../CartContext";

function Cart() {
  const { cartItems, removeItemFromCart } = useCart();

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Basket</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          Your basket is empty.
        </p>
      ) : (
        <ul>
          {cartItems.map((item, index) => (
            <li key={index} className="flex justify-between items-center mb-4">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-gray-600 dark:text-gray-300">{item.price}</p>
              </div>
              <button
                onClick={() => removeItemFromCart(index)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Cart;
