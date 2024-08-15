import React from 'react';

function MenuItem({ title, price, calories, imageUrl }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition">
      <img src={imageUrl} alt={title} className="h-40 w-full object-cover rounded-t-lg" />
      <div className="p-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300">{calories} cal</p>
        <p className="text-xl font-semibold mt-2">{price}</p>
        <button className="mt-4 bg-orange-500 text-white p-2 rounded">Add</button>
      </div>
    </div>
  );
}

export default MenuItem;
