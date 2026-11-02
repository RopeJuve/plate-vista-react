import { useState } from "react";
import BarPageNav from "../Components/BarComponents/BarPageNav";
import TableView from "../Components/BarComponents/TableView";
import OrdersView from "../Components/BarComponents/OrdersView";
import { openOrderCount } from "../features/staff-board/boardLanes";
import { useStaffBoard } from "../features/staff-board/StaffBoardProvider";

/** The staff home screen: the floor of tables, or the order rail. */
const BarPageTableView = () => {
  const [selected, setSelected] = useState("dineIn");
  const { state } = useStaffBoard();
  const openOrders = openOrderCount(state);

  return (
    <div className="steel steel-ground flex min-h-dvh flex-col text-paper">
      <BarPageNav selected={selected} setSelected={setSelected} counts={{ orders: openOrders }} />
      <main className="flex min-h-0 flex-1 flex-col">
        {selected === "dineIn" && <TableView />}
        {selected === "orders" && <OrdersView />}
      </main>
    </div>
  );
};

export default BarPageTableView;
