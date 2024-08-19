import React from 'react';

function MenuItemList({ items, addToCart }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.id} className="border p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md">
          <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.name}</h3>
          <p className="text-gray-700 dark:text-gray-300">{item.calories} cal</p>
          <p className="text-gray-900 dark:text-gray-100">${item.price.toFixed(2)}</p>
          <button
            onClick={() => addToCart(item)}
            className="mt-2 bg-orange-500 text-white p-2 rounded-lg w-full"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

export default MenuItemList;
