import { useEffect, useState } from "react";
import { useOrder } from "../../contexts/OrderContext";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import { useOutletContext } from "react-router-dom";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const OrderDetails = () => {
  const { userData } = useOutletContext();
  const { sendMessage, readyState, lastMessage, setUserId, tableNum, messages } =
    useWebSocketContext();
  const { menuItems, clearOrder } = useOrder();
  const [orders, setOrders] = useState([]);
  const [visibleOrders, setVisibleOrders] = useState({});
  useEffect(() => {
    if (userData) {
      setUserId(userData.user.id);
    }
    if (lastMessage) {
      try {
        const messageData = JSON.parse(lastMessage.data);
        if (messageData?.type === "orderSuccess") {
          const tableMessages = messages.filter(message => 
            message.tableNum === tableNum.toString() && 
            message.type === "orderSuccess"
          );
          if (tableMessages.length > 0) {
            const latestMessage = tableMessages[tableMessages.length - 1];
            if (latestMessage?.payload?.orders) {
              setOrders(prevOrders => {
                const newOrders = latestMessage.payload.orders;
                if (JSON.stringify(prevOrders) !== JSON.stringify(newOrders)) {
                  return newOrders;
                }
                return prevOrders;
              });
            } else {
              console.log("No orders found in the latest message for table:", tableNum);
            }
          } else {
            console.log("No order messages found for table:", tableNum);
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }
  }, [userData, lastMessage]);
  console.log(orders);

  const handleSendMessages = () => {
    const menuItemsForSend = menuItems.map((item) => {
      return { product: item._id, quantity: item.quantity };
    });

    sendMessage(
      JSON.stringify({
        type: "newOrder",
        payload: {
          user: userData.user.id,
          menuItems: menuItemsForSend,
          orderStatus: "Processing",
        },
      })
    );
    clearOrder();
  };

  const handleToggleOrder = (orderId) => {
    setVisibleOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const total = orders?.reduce((acc, item) => acc + item.totalPrice, 0);

  return (
    <div className="col-span-2 bg-secondary-dark-bg rounded-lg flex flex-col justify-between">
      <div className="flex items-center gap-2 justify-center">
        <h2 className="text-xl text-center uppercase font-semibold bg-secondary-dark-bg pb-1">
          Order Details
        </h2>
        <span
          className={`w-2 h-2 rounded-full animate-pulse ${
            readyState === 0
              ? "bg-yellow-400"
              : readyState === 1
              ? "bg-green-400"
              : "bg-red-400"
          }`}
        ></span>
      </div>
      <div className=" bg-main-dark-bg p-2 flex-grow flex flex-col justify-between gap-1 h-[70vh] overflow-y-scroll">
        {orders?.length !== 0 &&
          orders?.map((order) => (
            <div
              key={order._id}
              className={`${
                order.orderStatus === "Pending"
                  ? "bg-yellow-400"
                  : order.orderStatus === "Processing"
                  ? "bg-blue-400 "
                  : "bg-green-400"
              } border p-2 space-y-1 rounded-lg`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[0.785rem] tracking-wider">
                  {order.orderStatus}
                </span>
                <MdOutlineKeyboardArrowDown
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => handleToggleOrder(order._id)}
                />
              </div>
              {visibleOrders[order._id] && (
                <div>
                  {order?.menuItems?.map((menuItem) => (
                    <div
                      key={menuItem._id}
                      className="flex gap-4 items-center py-2"
                    >
                      <p className="w-2/3 font-semibold">
                        {menuItem.product.title}
                      </p>
                      <p className="flex-grow">{menuItem.quantity}</p>
                      <p className="font-semibold">
                        {(menuItem.product.price * menuItem.quantity).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        {menuItems?.length !== 0 &&
          menuItems.map((menuItem) => (
            <div key={`${menuItem._id}`} className="flex justify-between p-2">
              <p>{menuItem.title}</p>
              <p>{menuItem.quantity}</p>
            </div>
          ))}
      </div>
      <div className="flex justify-between p-2 flex-grow items-end">
        <p>Total</p>
        <p>{`${total?.toFixed(2)}€`}</p>
      </div>
      <button
        className="bg-blue-500 text-white w-full p-2 rounded-lg"
        onClick={handleSendMessages}
        disabled={menuItems?.length === 0}
      >
        Place Order
      </button>
    </div>
  );
};

export default OrderDetails;
