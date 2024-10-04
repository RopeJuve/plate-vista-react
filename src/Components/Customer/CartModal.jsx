import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import CartContent from "./CartContent";

const CartModal = ({ closeModal }) => {
  const { tableId } = useParams();
  const { sendMessage, lastMessage, messages } = useWebSocketContext();
  const { clearCart, cart } = useCart();
  const [selectedTab, setSelectedTab] = useState("cart");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const messageData = JSON.parse(lastMessage.data);
        if (messageData?.type === "orderSuccess") {
          const tableMessages = messages.filter(
            (message) =>
             Number(message.tableNum) === Number(tableId) &&
              message.type === "orderSuccess"
          );
          if (tableMessages.length > 0) {
            const latestMessage = tableMessages[tableMessages.length - 1];
            setOrders(latestMessage.payload.orders);
          } else {
            console.log("No order messages found for table:", tableId);
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }
  }, [lastMessage, messages]);

  const changeTab = (tab) => {
    setSelectedTab(tab);
  };

  const handleSendMessages = () => {
    const menuItemsForSend = cart.map((item) => {
      return { product: item._id, quantity: item.quantity };
    });

    sendMessage(
      JSON.stringify({
        type: "newOrder",
        payload: {
          user: null,
          menuItems: menuItemsForSend,
        },
      })
    );
    clearCart();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => closeModal(false)}
      ></div>

      <div
        className="fixed w-96 z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg bg-slate-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-2 items-center mb-6 bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => changeTab("cart")}
            className={
              selectedTab === "cart"
                ? `w-1/2 py-1 text-center rounded-lg text-white bg-orange-400 transition-all ease-in-out duration-500`
                : `w-1/2 py-1 text-center rounded-lg text-orange-400 transition-all ease-in-out duration-500`
            }
          >
            Cart
          </button>
          <button
            onClick={() => changeTab("bill")}
            className={
              selectedTab === "bill"
                ? `w-1/2 py-1 text-center text-white bg-orange-400 rounded-lg transition-all ease-in-out duration-500`
                : `w-1/2 py-1 text-center rounded-lg text-orange-400 transition-all ease-in-out duration-500`
            }
          >
            Bill
          </button>
        </div>

        {selectedTab === "cart" && (
          <CartContent
            variant="cart"
            orders={orders}
            handleSendMessages={handleSendMessages}
          />
        )}
        {selectedTab === "bill" && (
          <CartContent
            variant="bill"
            orders={orders}
            handleSendMessages={handleSendMessages}
          />
        )}
      </div>
    </>
  );
};

export default CartModal;
