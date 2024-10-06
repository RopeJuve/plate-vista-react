import { useEffect, useState } from "react";
import BarPageNav from "../Components/BarComponents/BarPageNav";
import TableView from "../Components/BarComponents/TableView";
import OrdersView from "../Components/BarComponents/OrdersView";
import { useWebSocketContext } from "../contexts/WebSocketContext";
import { useOutletContext } from "react-router-dom";

const BarPageTableView = () => {
  const [selected, setSelected] = useState("dineIn");
  const { setUserId } = useWebSocketContext();
  const { userData } = useOutletContext();
  useEffect(() => {
    if (userData) {
      setUserId(userData.user.id);
    }
  }, [userData, setUserId]);

  return (
    <div className=" bg-main-dark-bg text-gray-100 pt-6">
      <BarPageNav selected={selected} setSelected={setSelected} />
      {selected === "dineIn" && <TableView />}
      {selected === "orders" && <OrdersView />}
    </div>
  );
};

export default BarPageTableView;
