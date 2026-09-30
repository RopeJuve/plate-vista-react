import { createContext, useContext, useEffect, useMemo, ReactNode } from "react";
import { restoreLines } from "../features/guest-ordering/cartLines";
import { useCartLines } from "../features/guest-ordering/hooks/useCartLines";
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
    const parsed = JSON.parse(raw) as { expiresAt?: number; items?: unknown } | unknown[];
    if (!Array.isArray(parsed) && parsed?.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(storageKey);
      return [];
    }
    return restoreLines(Array.isArray(parsed) ? parsed : parsed.items);
  } catch {
    return [];
  }
};

/** The guest's cart: the lines they are about to order, kept on the device for this table session. */
export const CartProvider = ({ children, sessionId }: { children?: ReactNode; sessionId: string }) => {
  const storageKey = sessionId ? `cart:${sessionId}` : "cart";
  const { lines: cart, addLine, setQuantity, setNotes, removeLine, clearLines, replaceLines } = useCartLines(() =>
    readCart(storageKey)
  );

  useEffect(() => {
    replaceLines(readCart(storageKey));
  }, [replaceLines, storageKey]);

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        items: cart,
        expiresAt: Date.now() + CART_TTL_MS,
      })
    );
  }, [cart, storageKey]);

  const value = useMemo(
    () => ({ cart, addLine, setQuantity, setNotes, removeLine, clearCart: clearLines }),
    [cart, addLine, setQuantity, setNotes, removeLine, clearLines]
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
