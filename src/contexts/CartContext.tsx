import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { LIMITS } from "../shared/realtime/protocol";
import type { CartLine } from "../features/guest-ordering/types";

type CartContextValue = {
  cart: CartLine[];
  addLine: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setNotes: (productId: string, notes: string) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_TTL_MS = 4 * 60 * 60 * 1000;

const readCart = (storageKey: string): CartLine[] => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as { expiresAt?: number; items?: CartLine[] } | CartLine[];
    if (!Array.isArray(parsed) && parsed?.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(storageKey);
      return [];
    }
    const items = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(items)) {
      return [];
    }
    return items
      .filter((item) => item && typeof item.productId === "string")
      .map((item) => ({
        productId: item.productId,
        quantity: Math.min(LIMITS.MAX_QUANTITY_PER_ITEM, Math.max(1, Number(item.quantity) || 1)),
        notes: String(item.notes || "").slice(0, LIMITS.MAX_NOTES_LENGTH),
      }));
  } catch {
    return [];
  }
};

export const CartProvider = ({ children, sessionId }: { children?: ReactNode; sessionId: string }) => {
  const storageKey = sessionId ? `cart:${sessionId}` : "cart";
  const [cart, setCart] = useState<CartLine[]>(() => readCart(storageKey));

  useEffect(() => {
    setCart(readCart(storageKey));
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        items: cart,
        expiresAt: Date.now() + CART_TTL_MS,
      })
    );
  }, [cart, storageKey]);

  const addLine = useCallback((productId: string) => {
    setCart((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (!existing) {
        if (current.length >= LIMITS.MAX_ITEMS_PER_ORDER) {
          return current;
        }
        return [...current, { productId, quantity: 1, notes: "" }];
      }
      if (existing.quantity >= LIMITS.MAX_QUANTITY_PER_ITEM) {
        return current;
      }
      return current.map((line) =>
        line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line
      );
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const nextQuantity = Math.min(LIMITS.MAX_QUANTITY_PER_ITEM, Math.max(1, Math.round(quantity)));
    setCart((current) =>
      current.map((line) => (line.productId === productId ? { ...line, quantity: nextQuantity } : line))
    );
  }, []);

  const setNotes = useCallback((productId: string, notes: string) => {
    setCart((current) =>
      current.map((line) =>
        line.productId === productId
          ? { ...line, notes: notes.slice(0, LIMITS.MAX_NOTES_LENGTH) }
          : line
      )
    );
  }, []);

  const removeLine = useCallback((productId: string) => {
    setCart((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const value = useMemo(
    () => ({ cart, addLine, setQuantity, setNotes, removeLine, clearCart }),
    [cart, addLine, setQuantity, setNotes, removeLine, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
