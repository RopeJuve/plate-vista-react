import { useEffect, useState } from "react";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import { ORDER_STATUS } from "../../constants/orderStatus";
import OrderCard from "./OrderCard";

const BarOrders = ({ title }: { title: string }) => {
  const [orders, setOrder] = useState([]);
  const { lastMessage, tables } = useWebSocketContext();
  useEffect(() => {
    if (tables) {
      setOrder(tables);
    }
  }, [lastMessage, tables]);
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
                  return (item.orders || [])
                    .filter((order) => order.orderStatus === ORDER_STATUS.PENDING)
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
                  return (item.orders || [])
                    .filter((order) => order.orderStatus === ORDER_STATUS.PROCESSING)
                    .sort()
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
                  return (item.orders || [])
                    .filter((order) => order.orderStatus === ORDER_STATUS.COMPLETE)
                    .sort()
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
