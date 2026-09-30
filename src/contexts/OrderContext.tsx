import { createContext, useContext, useMemo, ReactNode } from "react";
import { useCartLines } from "../features/guest-ordering/hooks/useCartLines";
import type { CartLine } from "../features/guest-ordering/types";

type OrderContextValue = {
  /** The lines staff have tapped in for this table and not sent yet. */
  pad: CartLine[];
  addLine: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setNotes: (productId: string, notes: string) => void;
  removeLine: (productId: string) => void;
  clearPad: () => void;
};

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

/** The staff order pad. It lives only as long as the table is open on screen. */
export const OrderProvider = ({ children }: { children?: ReactNode }) => {
  const { lines: pad, addLine, setQuantity, setNotes, removeLine, clearLines } = useCartLines();

  const value = useMemo(
    () => ({ pad, addLine, setQuantity, setNotes, removeLine, clearPad: clearLines }),
    [pad, addLine, setQuantity, setNotes, removeLine, clearLines]
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
