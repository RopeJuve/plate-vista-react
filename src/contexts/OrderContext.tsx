import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem } from "../types";

const OrderContext = createContext<any>(undefined);

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }: { children?: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<CartItem[]>([]);

  const addOrder = (item: CartItem) => {
    setMenuItems((prevOrder) => {
      const existingItemIndex = prevOrder.findIndex(
        (orderItem) => orderItem._id === item._id
      );
      if (existingItemIndex !== -1) {
        const updatedOrder = [...prevOrder];
        updatedOrder[existingItemIndex] = {
          ...updatedOrder[existingItemIndex],
          quantity: updatedOrder[existingItemIndex].quantity + item.quantity,
        };
        return updatedOrder;
      } else {
        return [...prevOrder, item];
      }
    });
  };

  const removeItemFromOrder = (itemId: string) =>
    setMenuItems((prevOrder) =>
      prevOrder.filter((item) => item._id !== itemId)
    );

  const clearOrder = () => setMenuItems([]);

  return (
    <OrderContext.Provider
      value={{
        menuItems,
        setMenuItems,
        addOrder,
        removeItemFromOrder,
        clearOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
