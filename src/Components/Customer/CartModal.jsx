import { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import { useAuth } from "../../contexts/AuthContext";

const CartModal = ({ closeModal }) => {
  const { sendMessage, lastMessage } = useWebSocketContext();
  const { user } = useAuth();
  const { clearCart, cart } = useCart();
  const [selectedTab, setSelectedTab] = useState("cart");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (lastMessage) {
      const messageData = JSON.parse(lastMessage?.data);
      if (messageData?.type === "orderSuccess") {
        setOrders(messageData.payload.orders);
      }
    }
  }, [lastMessage]);
  console.log(orders);

  const price = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalOrderPrice = orders.reduce(
    (acc, order) => acc + order.totalPrice,
    0
  );

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
          user: user?.user.id || null,
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
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex gap-2 items-center mb-6 bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => changeTab("cart")}
            className={
              selectedTab === "cart"
                ? `w-1/2 py-1 text-center rounded-lg text-white bg-orange-400 transition-all ease-in-out duration-700`
                : `w-1/2 py-1 text-center rounded-lg text-orange-400 transition-all ease-in-out duration-700`
            }
          >
            Cart
          </button>
          <button
            onClick={() => changeTab("bill")}
            className={
              selectedTab === "bill"
                ? `w-1/2 py-1 text-center text-white bg-orange-400 rounded-lg transition-all ease-in-out duration-700`
                : `w-1/2 py-1 text-center rounded-lg text-orange-400 transition-all ease-in-out duration-700`
            }
          >
            Bill
          </button>
        </div>

        {selectedTab === "cart" && (
          <div className="mt-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 items-center border-b border-gray-200 py-2"
              >
                <p className="w-2/3 font-semibold">{item.title}</p>
                <p className="flex-grow">{item.quantity}</p>
                <p className="font-semibold">{item.price * item.quantity}€</p>
              </div>
            ))}
            <div className="flex justify-between items-center mt-4">
              <h3 className="text-xl font-semibold">Total</h3>
              <h3 className="font-semibold">{price.toFixed(2)}€</h3>
            </div>
          </div>
        )}
        {selectedTab === "bill" && (
          <div className="mt-4">
            {orders.map((order) => (
              <div key={order._id}>
                {order.menuItems.map((menuItem) => (
                  <div
                    key={menuItem._id}
                    className="flex gap-4 items-center border-b border-gray-200 py-2"
                  >
                    <p className="w-2/3 font-semibold">
                      {menuItem.product.title}
                    </p>
                    <p className="flex-grow">{menuItem.quantity}</p>
                    <p className="font-semibold">
                      {menuItem.product.price * menuItem.quantity}€
                    </p>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex justify-between items-center mt-4">
              <h3 className="text-xl font-semibold">Total</h3>
              <h3 className="font-semibold">{totalOrderPrice.toFixed(2)}€</h3>
            </div>
          </div>
        )}
        {selectedTab === "cart" && (
          <div className="flex items-center gap-2">
            <button
              className="bg-orange-400 text-white w-full py-2 mt-6 rounded-lg"
              onClick={handleSendMessages}
            >
              Order Now
            </button>
            <button
              className="bg-red-400 text-white w-full py-2 mt-6 rounded-lg"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        )}
        {selectedTab === "bill" && (
          <button
            className="bg-blue-400 text-white w-full py-2 mt-6 rounded-lg"
            onClick={clearCart}
          >
            Call Waiter
          </button>
        )}
      </div>
    </>
  );
};

export default CartModal;
