import React, { useState } from 'react';

function MenuDetail({ item, addToCart, closeDetail }) {
  const [quantity, setQuantity] = useState(1);
  const [capacity, setCapacity] = useState('300ml');  // Default capacity
  const [price, setPrice] = useState(item.price);  // Default price

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value));
  };

  const handleCapacityChange = (e) => {
    const selectedCapacity = e.target.value;
    setCapacity(selectedCapacity);
    if (selectedCapacity === '300ml') {
      setPrice(item.price);  // Default price for 300ml
    } else if (selectedCapacity === '500ml') {
      setPrice(item.price + 2);  // Increase price for 500ml by $2 (example)
    }
  };

  const handleAddToCart = () => {
    addToCart({
      ...item,
      quantity,
      capacity: item.category === 'Drinking' ? capacity : null,
      price: item.category === 'Drinking' ? price * quantity : item.price * quantity,
    });
    closeDetail(); // Close the detail view after adding to cart
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-gray-800 text-white p-8 rounded-lg max-w-lg w-full">
        <button className="text-right text-lg mb-4" onClick={closeDetail}>
          Close
        </button>
        <img src="https://via.placeholder.com/300x200" alt={item.name} className="w-full h-40 object-cover rounded-lg mb-4" />
        <h3 className="text-2xl mb-2">{item.name}</h3>
        <p className="text-sm mb-4">{item.description}</p>
        <p className="text-lg mb-4">${(item.category === 'Drinking' ? price : item.price).toFixed(2)}</p>

        {/* Capacity selection for Drinking items */}
        {item.category === 'Drinking' && (
          <div className="mt-2 mb-4">
            <label className="block text-sm mb-2">Capacity:</label>
            <select
              value={capacity}
              onChange={handleCapacityChange}
              className="bg-gray-700 text-white border rounded p-1 w-full"
            >
              <option value="300ml">300ml - ${item.price.toFixed(2)}</option>
              <option value="500ml">500ml - ${(item.price + 2).toFixed(2)}</option>
            </select>
          </div>
        )}

        <div className="mt-2 mb-4">
          <label className="block text-sm">Quantity:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="bg-gray-700 text-white border rounded p-1 w-16"
          />
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-orange-500 text-white px-4 py-2 rounded mt-2"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default MenuDetail;
