import { useEffect, useState } from "react";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import OrderCard from "./OrderCard";

const BarOrders = ({ title }) => {
  const [orders, setOrder] = useState([]);
  const { lastMessage, messages } = useWebSocketContext();
  useEffect(() => {
    if (lastMessage) {
      const messageData = JSON.parse(lastMessage.data);
      if (messageData.type === "allTables") {
        const tables = messages[messages.length - 1];
        if (tables.type === "allTables") {
          setOrder(tables.payload);
        }
      }
    }
  }, [lastMessage, messages]);
  console.log(messages);
  return (
    <div className="bg-secondary-dark-bg rounded-lg flex flex-col justify-between overflow-scroll pl-1.5">
      <h2 className="text-xl text-center uppercase font-semibold bg-secondary-dark-bg pb-1">
        {title}
      </h2>
      <div className=" text-center p-2 flex-grow flex flex-col justify-between">
        <div className="flex flex-col space-y-2">
          {title === "New Orders"
            ? orders
                .map((item) => {
                  return item.orders
                    .filter((order) => order.orderStatus === "Pending")
                    .map((order) => {
                      return (
                        <OrderCard
                          key={order._id}
                          item={order}
                          table={item.tableNumber}
                        />
                      );
                    });
                })
                .reverse()
            : title === "Accepted"
            ? orders
                .map((item) => {
                  return item.orders
                    .filter((order) => order.orderStatus === "Processing")
                    .map((order) => {
                      return (
                        <OrderCard
                          key={order._id}
                          item={order}
                          table={item.tableNumber}
                          variant="accepted"
                        />
                      );
                    });
                })
                .reverse()
            : orders
                .map((item) => {
                  return item.orders
                    .filter((order) => order.orderStatus === "Completed")
                    .map((order) => {
                      return (
                        <OrderCard
                          key={order._id}
                          item={order}
                          table={item.tableNumber}
                          variant="completed"
                        />
                      );
                    });
                })
                .reverse()}
        </div>
      </div>
    </div>
  );
};

export default BarOrders;
