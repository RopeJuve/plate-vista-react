import React from "react";
import OrdersList from "./OrdersList";

const OrdersView = () => {
  return (
    <div className="max-w-screen-xl mx-auto mt-6">
      <h2 className="text-xl font font-semibold mb-2">Orders</h2>
      <OrdersList />
    </div>
  );
};

export default OrdersView;
