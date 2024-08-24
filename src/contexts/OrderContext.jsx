import { createContext, useContext, useState } from "react";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);

  const addOrder = (item) => {
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

  const removeItemFromOrder = (itemId) =>
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
