import React from "react";
import OrderDetails from "../Components/BarComponents/OrderDetails";

const OrderPage = () => {
  return (
      <div className=" bg-main-dark-bg text-gray-100 h-screen overflow-hidden">
          <BarHeader />
          <div className="max-w-3xl mx-auto grid grid-cols-6 mt-3 h-[85%] gap-3">
              <OrderDetails />
          </div>
      </div>
  );
};

export default OrderPage;
