import React, { createContext, useState, useContext } from 'react';

// Create a Context for the cart
const CartContext = createContext();

// Custom hook to use the CartContext
export const useCart = () => {
  return useContext(CartContext);
};

// Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const addItemToCart = (item) => {
    setCartItems((prevItems) => [...prevItems, item]);
  };

  const removeItemFromCart = (index) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  return (
    <CartContext.Provider value={{ cartItems, addItemToCart, removeItemFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
