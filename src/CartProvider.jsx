// src/CartProvider.jsx
import React, { createContext, useState } from 'react';

// Create a Context for the Cart
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    return (
        <CartContext.Provider value={{ cart, setCart }}>
            {children}
        </CartContext.Provider>
    );
};
