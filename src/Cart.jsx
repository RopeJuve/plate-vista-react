// src/Cart.jsx
import React from 'react';

function Cart({ cart, removeFromCart }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 shadow-md">
      <h2 className="text-xl font-bold mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cart.map(item => (
          <div key={item.id} className="flex justify-between mb-4">
            <div>
              <p>{item.name}</p>
              <p>Unit Price: ${item.price.toFixed(2)}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
            <button
              className="text-red-500"
              onClick={() => removeFromCart(item.id)}
            >
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Cart;
