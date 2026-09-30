import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { LIMITS } from "../shared/realtime/protocol";
import type { CartLine } from "../features/guest-ordering/types";

type OrderContextValue = {
  menuItems: CartLine[];
  addOrder: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setNotes: (productId: string, notes: string) => void;
  removeItemFromOrder: (productId: string) => void;
  clearOrder: () => void;
};

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export const OrderProvider = ({ children }: { children?: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<CartLine[]>([]);

  const addOrder = useCallback((productId: string) => {
    setMenuItems((current) => {
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
    setMenuItems((current) =>
      current.map((line) => (line.productId === productId ? { ...line, quantity: nextQuantity } : line))
    );
  }, []);

  const setNotes = useCallback((productId: string, notes: string) => {
    setMenuItems((current) =>
      current.map((line) =>
        line.productId === productId ? { ...line, notes: notes.slice(0, LIMITS.MAX_NOTES_LENGTH) } : line
      )
    );
  }, []);

  const removeItemFromOrder = useCallback((productId: string) => {
    setMenuItems((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const clearOrder = useCallback(() => setMenuItems([]), []);

  const value = useMemo(
    () => ({ menuItems, addOrder, setQuantity, setNotes, removeItemFromOrder, clearOrder }),
    [menuItems, addOrder, setQuantity, setNotes, removeItemFromOrder, clearOrder]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within OrderProvider");
  }
  return context;
};
