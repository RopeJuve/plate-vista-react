import { timeSinceOrder } from "../../services/time";
import { GiSandsOfTime } from "react-icons/gi";
import OrderItem from "./OrderItem";
import { PiSealCheckFill } from "react-icons/pi";
import { IoCloseCircle } from "react-icons/io5";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import { ORDER_STATUS, ORDER_STATUS_LABEL } from "../../constants/orderStatus";

const OrderCard = ({ item, table, variant }) => {
  const { sendMessage, queueDeletedOrder } = useWebSocketContext();
  const orderStatus = variant != "accepted" ? ORDER_STATUS.PROCESSING : ORDER_STATUS.COMPLETE;
  const handleAcceptOrder = (orderId, status) => {
    sendMessage(
      JSON.stringify({
        type: "changeStatus",
        payload: {
          orderId,
          status,
          tableNum: table,
        },
      }),
      false
    );
  };

  const handleRejectOrder = (orderId) => {
    const confirmed = window.confirm("Delete this order?");
    if (!confirmed) {
      return;
    }
    queueDeletedOrder(orderId);
    sendMessage(
      JSON.stringify({
        type: "deleteOrder",
        payload: { orderId },
      }),
      false
    );
  };
  return (
    <div
      key={item._id}
      className="bg-slate-100 text-gray-500 flex w-full text-left p-2 space-y-1 rounded-lg"
    >
      <div className="flex-grow space-y-2">
        <h3 className="text-lg font-bold">Table {table}</h3>
        <OrderItem key={item._id} item={item} />
        <span className="text-[0.785rem] flex items-center gap-1 font-semibold opacity-75">
          <GiSandsOfTime className="inline-block" />
          {timeSinceOrder(item?.createdAt)}
        </span>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm font-bold">
            <p>Total:</p>
            {item.totalPrice}€
          </span>
          {variant === "completed" && (
            <span className="inline-flex opacity-70 text-[0.725rem] px-1 py-0.5 rounded-lg italic text-green-500 border border-green-500">
              {ORDER_STATUS_LABEL[ORDER_STATUS.COMPLETE]}
            </span>
          )}
        </div>
      </div>
      <div className="text-3xl flex flex-col-reverse justify-between">
        {variant !== "completed" && (
          <button
            className=" text-green-400 rounded-lg"
            onClick={() => handleAcceptOrder(item._id, orderStatus)}
          >
            <PiSealCheckFill className="inline-block" />
          </button>
        )}
        {variant !== "accepted" && variant !== "completed" && (
          <button
            type="button"
            className=" text-red-400"
            aria-label="Delete order"
            onClick={() => handleRejectOrder(item._id)}
          >
            <IoCloseCircle className="inline-block" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
