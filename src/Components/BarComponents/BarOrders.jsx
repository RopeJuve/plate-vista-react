import { useEffect, useState } from "react";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import OrderCard from "./OrderCard";

const BarOrders = ({ title }) => {
  const [orders, setOrder] = useState([]);
  const [table, setTable] = useState(null);
  const { lastMessage } = useWebSocketContext();
  useEffect(() => {
    if (lastMessage) {
      const messageData = JSON.parse(lastMessage.data);
      if (messageData.type === "orderSuccess") {
        setTable(messageData.payload.tableNumber);
        setOrder(messageData.payload.orders);
      }
    }
  }, [lastMessage]);

  return (
    <div className="bg-secondary-dark-bg rounded-lg flex flex-col justify-between overflow-scroll pl-1.5">
      <h2 className="text-xl text-center uppercase font-semibold bg-secondary-dark-bg pb-1">
        {title}
      </h2>
      <div className=" text-center p-2 flex-grow flex flex-col justify-between">
        <div className="flex flex-col space-y-2">
          {title === "New Orders"
            ? orders
                ?.filter((item) => item?.orderStatus === "Pending")
                .map((item) => (
                  <OrderCard key={item._id} item={item} table={table} />
                ))
                .reverse()
            : title === "Accepted"
            ? orders
                ?.filter((item) => item?.orderStatus === "Processing")
                .map((item) => (
                  <OrderCard
                    key={item._id}
                    item={item}
                    table={table}
                    variant="accepted"
                  />
                ))
                .reverse()
            : orders
                ?.filter((item) => item?.orderStatus === "Completed")
                .map((item) => (
                  <OrderCard
                    key={item._id}
                    item={item}
                    table={table}
                    variant="completed"
                  />
                ))
                .reverse()}
        </div>
      </div>
    </div>
  );
};

export default BarOrders;
