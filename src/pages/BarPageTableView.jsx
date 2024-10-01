import { useState } from "react";
import BarPageNav from "../Components/BarComponents/BarPageNav";
import TableView from "../Components/BarComponents/TableView";
import OrdersView from "../Components/BarComponents/OrdersView";

const BarPageTableView = () => {
  const [selected, setSelected] = useState("dineIn");
  console.log(selected);
  return (
    <div className=" bg-main-dark-bg text-gray-100 pt-6">
      <BarPageNav selected={selected} setSelected={setSelected} />
      {selected === "dineIn" && <TableView />}
      {selected === "orders" && <OrdersView />}
    </div>
  );
};

export default BarPageTableView;
