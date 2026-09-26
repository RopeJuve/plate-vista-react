import { listOrders } from "../../features/staff-board/boardState";
import { useOrderActions } from "../../features/staff-board/useOrderActions";
import { useStaffBoard } from "../../features/staff-board/StaffBoardProvider";
import type { OrderStatus, Station } from "../../shared/realtime/protocol";
import OrderCard from "./OrderCard";

const BarOrders = ({
  title,
  statuses,
  station,
}: {
  title: string;
  statuses: OrderStatus[];
  station: Station | "all";
}) => {
  const { state } = useStaffBoard();
  const { canSend } = useOrderActions();
  const orders = listOrders(state, statuses, station);

  return (
    <div className="flex flex-col justify-between overflow-scroll rounded-lg bg-secondary-dark-bg pl-1.5">
      <h2 className="bg-secondary-dark-bg pb-1 text-center text-xl font-semibold uppercase">{title}</h2>
      <div className="flex flex-grow flex-col justify-between p-2 text-center">
        <div className="flex flex-col space-y-2">
          {orders.map(({ order, tableNumber }) => (
            <OrderCard key={order._id} order={order} tableNumber={tableNumber} canSend={canSend} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarOrders;
