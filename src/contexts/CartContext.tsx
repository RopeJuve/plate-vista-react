import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem } from "../types";

const CartContext = createContext<any>(undefined);

export const useCart = () => useContext(CartContext);

const CART_TTL_MS = 4 * 60 * 60 * 1000;

const readCart = (storageKey: string): CartItem[] => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (parsed?.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(storageKey);
      return [];
    }
    return Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children, tableId }: { children?: ReactNode; tableId?: string }) {
  const storageKey = tableId ? `cart:${tableId}` : "cart";
  const [cart, setCart] = useState<CartItem[]>(() => readCart(storageKey));

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        items: cart,
        expiresAt: Date.now() + CART_TTL_MS,
      })
    );
  }, [cart, storageKey]);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prevCart) => {
      const itemExistIndex = prevCart.findIndex((i) => i._id === item._id);
      if (itemExistIndex === -1) {
        return [...prevCart, item];
      }

      return prevCart.map((cartItem, index) =>
        index === itemExistIndex
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem
      );
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
