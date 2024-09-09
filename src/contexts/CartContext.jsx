import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(
    localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []
  );

  const [orders, setOrders] = useState(
    localStorage.getItem("orders")
      ? JSON.parse(localStorage.getItem("orders"))
      : []
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const addOrder = (cart) => {
    setOrders([...orders, cart]);
  };
  const addToCart = (item) => {
    setCart((prevCart) => {
      const itemExistIndex = prevCart.findIndex((i) => i._id === item._id);

      if (itemExistIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[itemExistIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        return [...prevCart, item];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };
  const clearOrders = () => {
    setOrders([]);
  };
  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, addOrder, orders, clearOrders }}
    >
      {children}
    </CartContext.Provider>
  );
}