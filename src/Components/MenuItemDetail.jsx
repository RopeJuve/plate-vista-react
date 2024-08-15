import React from "react";
import { useCart } from "../CartContext";

function MenuItemDetail({ item, onClose }) {
  const { addItemToCart } = useCart();

  const handleAddToCart = () => {
    addItemToCart(item);
    onClose(); // Close the modal after adding to cart
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <button
          onClick={onClose}
          className="text-gray-500 dark:text-gray-300 mb-4"
        >
          Close
        </button>
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-64 w-full object-cover rounded-lg mb-4"
        />
        <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {item.description}
        </p>
        <p className="text-lg font-semibold mb-4">{item.price}</p>
        <div className="mb-4">
          <h3 className="font-bold">Choose Toppings</h3>
          <div className="flex flex-wrap space-x-2">
            <label>
              <input type="checkbox" className="mr-2" />
              Extra Cheese
            </label>
            <label>
              <input type="checkbox" className="mr-2" />
              Bacon
            </label>
            <label>
              <input type="checkbox" className="mr-2" />
              Mushrooms
            </label>
            {/* Add more options as needed */}
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-orange-500 text-white p-2 rounded w-full"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default MenuItemDetail;
