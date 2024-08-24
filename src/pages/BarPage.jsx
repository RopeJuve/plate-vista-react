import { useState } from "react";
import BarHeader from "../Components/BarComponents/BarHeader";
import OrderDetails from "../Components/BarComponents/OrderDetails";
import Categories from "../Components/BarComponents/Categories";
import BarMenuItems from "../Components/BarComponents/BarMenuItems";
import BarOrders from "../Components/BarComponents/BarOrders";



const BarPage = () => {
  const [category, setCategory] = useState("beer");
  return (
    <div className=" bg-main-dark-bg text-gray-100 h-screen overflow-hidden">
      <BarHeader />
      <div className=" mx-auto grid grid-cols-10 mt-3 h-[85%] gap-3">
        <BarOrders title='New Orders' />
        <OrderDetails />
        <Categories setCategory={setCategory} />
        <BarMenuItems category={category} />
        <BarOrders title='Accepted' />
      </div>
      {/* BarHeader */}
      {/* OrderDetails */}
      {/* Category */}
      {/* MenuItems */}
    </div>
  );
};

export default BarPage;
