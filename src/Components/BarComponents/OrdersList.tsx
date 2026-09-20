import BarOrders from "./BarOrders";
import { ORDER_STATUS, ORDER_STATUS_LABEL } from "../../constants/orderStatus";

const OrdersList = () => {
  return (
    <div className="grid grid-cols-3 gap-4 md:h-screen">
      <BarOrders title="New Orders" />
      <BarOrders title="Accepted" />
      <BarOrders title={ORDER_STATUS_LABEL[ORDER_STATUS.COMPLETE]} />
    </div>
  );
};

export default OrdersList;
