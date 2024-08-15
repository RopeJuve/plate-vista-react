import React from 'react';

function MenuNav() {
  return (
    <nav className="flex justify-center space-x-6 bg-gray-100 dark:bg-gray-900 p-4">
      <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Family-Style Meals</a>
      <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Appetizers</a>
      <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Classic Entrées</a>
      <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Amazing Alfredos</a>
      <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Soups, Salads & Breadsticks</a>
      <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Create Your Own Pasta</a>
      <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Drinking</a>
    </nav>
  );
}

export default MenuNav;
