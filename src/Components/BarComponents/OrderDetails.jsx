import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { ReadyState } from "react-use-websocket";
import { useOrder } from "../../contexts/OrderContext";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { ORDER_STATUS } from "../../constants/orderStatus";
import { notify } from "../../utils/notify";

const CONFIRM_TIMEOUT_MS = 10000;

const OrderDetails = () => {
  const { tableId } = useParams();
  const { userData } = useOutletContext();
  const { sendMessage, readyState, lastMessage } = useWebSocketContext();
  const { menuItems, clearOrder } = useOrder();
  const [orders, setOrders] = useState([]);
  const [visibleOrders, setVisibleOrders] = useState({});
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(null);
  const timeoutRef = useRef(null);

  const clearPending = () => {
    pendingRef.current = null;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPending(false);
  };

  useEffect(() => {
    if (!lastMessage?.data) {
      return;
    }

    let messageData;
    try {
      messageData = JSON.parse(lastMessage.data);
    } catch {
      return;
    }

    if (messageData.type === "error" && pendingRef.current) {
      clearPending();
      return;
    }

    if (messageData.type !== "orderSuccess" || !messageData.payload) {
      return;
    }

    const latestOrders = messageData.payload.orders ?? [];
    setOrders(latestOrders);

    if (pendingRef.current) {
      const hasNewOrder =
        latestOrders.some((order) => !pendingRef.current.knownIds.has(order._id)) ||
        latestOrders.length > pendingRef.current.previousCount;
      if (hasNewOrder) {
        clearOrder();
        notify("Order placed", "success");
        clearPending();
      }
    }
  }, [lastMessage, tableId, clearOrder]);

  const handleSendMessages = () => {
    if (pending || menuItems.length === 0) {
      return;
    }
    if (readyState !== ReadyState.OPEN) {
      notify("Not confirmed, check the order list before retrying");
      return;
    }

    pendingRef.current = {
      knownIds: new Set(orders.map((order) => order._id)),
      previousCount: orders.length,
    };
    setPending(true);

    sendMessage(
      JSON.stringify({
        type: "newOrder",
        payload: {
          user: userData?.user?.id,
          menuItems: menuItems.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          orderStatus: ORDER_STATUS.PROCESSING,
        },
      }),
      false
    );

    timeoutRef.current = window.setTimeout(() => {
      if (pendingRef.current) {
        pendingRef.current = null;
        setPending(false);
        notify("Not confirmed, check the order list before retrying");
      }
    }, CONFIRM_TIMEOUT_MS);
  };

  const handleToggleOrder = (orderId) => {
    setVisibleOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const total = orders?.reduce((acc, item) => acc + (item.totalPrice || 0), 0);

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
      <div className=" bg-main-dark-bg p-2 flex-grow flex flex-col gap-1 h-[70vh] overflow-y-scroll">
        {orders?.length !== 0 &&
          orders
            ?.map((order) => (
              <div
                key={order._id}
                className={`${
                  order.orderStatus === ORDER_STATUS.PENDING
                    ? "bg-yellow-400"
                    : order.orderStatus === ORDER_STATUS.PROCESSING
                    ? "bg-blue-400 "
                    : "bg-green-400"
                } p-2 space-y-1 rounded-lg`}
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
                          {menuItem.product?.title ?? "Unavailable item"}
                        </p>
                        <p className="flex-grow">{menuItem.quantity}</p>
                        <p className="font-semibold">
                          {((menuItem.product?.price || 0) * menuItem.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
            .reverse()}
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
        type="button"
        className="bg-blue-500 text-white w-full p-2 rounded-lg disabled:opacity-50"
        onClick={handleSendMessages}
        disabled={menuItems?.length === 0 || pending}
      >
        {pending ? "Placing..." : "Place Order"}
      </button>
    </div>
  );
};

export default OrderDetails;
