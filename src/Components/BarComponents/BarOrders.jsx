import { useEffect, useState } from "react";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import OrderItem from "./OrderItem";
import { timeSinceOrder } from "../../services/time";

const BarOrders = ({ title }) => {
  const [orders, setOrder] = useState([]);
  const { lastMessage, sendMessage } = useWebSocketContext();
  useEffect(() => {
    if (lastMessage) {
      const messageData = JSON.parse(lastMessage.data);
      if (messageData.type === "orderSuccess") {
        console.log(messageData);
        setOrder([...orders, messageData.payload]);
      }
    }
  }, [lastMessage]);

  const handleAcceptOrder = (orderId, status) => {
    sendMessage(
      JSON.stringify({
        type: "changeStatus",
        payload: {
          orderId,
          status,
        },
      })
    );
    setOrder(orders.map((order) => order._id !== orderId));
  };
  console.log(orders);
  return (
    <div className="col-span-2 bg-secondary-dark-bg rounded-lg flex flex-col justify-between">
      <h2 className="text-xl text-center uppercase font-semibold bg-secondary-dark-bg pb-1">
        {title}
      </h2>
      <div className=" text-center bg-main-dark-bg p-2 flex-grow flex flex-col justify-between">
        <ul className="flex flex-col space-y-2">
          {title === "New Orders"
            ? orders
                ?.filter((item) => item?.orderStatus === "Pending")
                .map((item) => (
                  <div className="border p-3 space-y-1 rounded-lg">
                    <span className="text-[0.785rem] tracking-wider">
                      {item?.orderStatus}
                    </span>
                    <OrderItem key={item._id} item={item} />
                    <span className="text-[0.785rem] font-semibold opacity-80">
                      {timeSinceOrder(item?.createdAt)}
                    </span>
                    <div>
                      <button
                        className="bg-green-500 text-white rounded-lg px-2 py-1"
                        onClick={() =>
                          handleAcceptOrder(item._id, "Processing")
                        }
                      >
                        Accept
                      </button>
                      <button className="bg-red-500 text-white rounded-lg px-2 py-1">
                        Reject
                      </button>
                    </div>
                  </div>
                ))
            : orders
                ?.filter((item) => item?.orderStatus === "Processing")
                .map((item) => (
                  <div className="border p-3 space-y-1 rounded-lg">
                    <span className="text-[0.785rem] tracking-wider">
                      {item.orderStatus}
                    </span>
                    <OrderItem key={item._id} item={item} />
                    <span className="text-[0.785rem] font-semibold opacity-80">
                      {timeSinceOrder(item.updatedAt)}
                    </span>
                  </div>
                ))}
        </ul>
      </div>
    </div>
  );
};

export default BarOrders;
