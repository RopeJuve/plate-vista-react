
import { useEffect } from "react";
import { useOrder } from "../../contexts/OrderContext";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import  { useOutletContext } from "react-router-dom";

const OrderDetails = () => {
  const { userData } = useOutletContext();
  console.log(userData)
  const { sendMessage, messages, readyState, lastMessage, setUserId } =
    useWebSocketContext();
    console.log(messages, lastMessage?.data)
  const { menuItems } = useOrder();
 

  useEffect(() => {
    if (userData) {
      setUserId(userData.user.id);
    }
  }, [userData]);

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
  };

  const total = menuItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  return (
    <div className="col-span-2 bg-secondary-dark-bg rounded-lg flex flex-col justify-between">
      <h2 className="text-xl text-center uppercase font-semibold bg-secondary-dark-bg pb-1">
        Order Details
      </h2>
      <span className="text-center text-white">
        {" "}
        {readyState === 0
          ? "Connecting..."
          : readyState === 1
          ? "Connected"
          : "Disconnected"}{" "}
      </span>
      <span className="text-center text-white"> {messages[0]?.type} </span>
      <div className=" text-center bg-main-dark-bg p-2 flex-grow flex flex-col justify-between">
        {menuItems.length !== 0 &&
          menuItems.map((menuItem) => (
            <div key={`${menuItem._id}`} className="flex justify-between p-2">
              <p>{menuItem.title}</p>
              <p>{menuItem.quantity}</p>
            </div>
          ))}
        <div className="flex justify-between p-2 flex-grow items-end">
          <p>Total</p>
          <p>{`$${total.toFixed(2)}`}</p>
        </div>
      </div>
      <button
        className="bg-blue-500 text-white w-full p-2 rounded-lg"
        onClick={handleSendMessages}
        disabled={menuItems.length === 0}
      >
        Place Order
      </button>
    </div>
  );
};

export default OrderDetails;
