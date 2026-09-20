import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ReadyState } from "react-use-websocket";
import { useCart } from "../../contexts/CartContext";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import CartContent from "./CartContent";
import { CartItem, Order } from "../../types";

const CONFIRM_TIMEOUT_MS = 10000;

const parseSocketMessage = (lastMessage) => {
  if (!lastMessage?.data) {
    return null;
  }
  try {
    return JSON.parse(lastMessage.data);
  } catch {
    return null;
  }
};

const CartModal = ({ closeModal }: { items?: CartItem[]; closeModal: (open: boolean) => void }) => {
  const { tableId } = useParams();
  const { sendMessage, lastMessage, readyState } = useWebSocketContext();
  const { clearCart, cart } = useCart();
  const [selectedTab, setSelectedTab] = useState("cart");
  const [orders, setOrders] = useState<Order[]>([]);
  const [pending, setPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
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
    const messageData = parseSocketMessage(lastMessage);
    if (!messageData) {
      return;
    }

    if (messageData.type === "error" && pendingRef.current) {
      setStatusMessage(
        typeof messageData.payload === "string"
          ? messageData.payload
          : "Order failed"
      );
      clearPending();
      return;
    }

    if (messageData.type !== "orderSuccess" || !messageData.payload) {
      return;
    }

    const nextOrders = messageData.payload.orders ?? [];
    setOrders(nextOrders);

    if (pendingRef.current) {
      const hasNewOrder =
        nextOrders.some((order) => !pendingRef.current.knownIds.has(order._id)) ||
        nextOrders.length > pendingRef.current.previousCount;
      if (hasNewOrder) {
        clearCart();
        setStatusMessage("Order Placed!");
        clearPending();
      }
    }
  }, [lastMessage, tableId, clearCart]);

  const handleSendMessages = () => {
    if (pending) {
      return;
    }
    if (readyState !== ReadyState.OPEN) {
      setStatusMessage("Not confirmed, check the Bill tab before retrying");
      return;
    }

    pendingRef.current = {
      knownIds: new Set(orders.map((order) => order._id)),
      previousCount: orders.length,
    };
    setPending(true);
    setStatusMessage("Placing order...");

    sendMessage(
      JSON.stringify({
        type: "newOrder",
        payload: {
          user: null,
          menuItems: cart.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
        },
      }),
      false
    );

    timeoutRef.current = window.setTimeout(() => {
      if (pendingRef.current) {
        pendingRef.current = null;
        setPending(false);
        setStatusMessage("Not confirmed, check the Bill tab before retrying");
      }
    }, CONFIRM_TIMEOUT_MS);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => closeModal(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeModal(false);
          }
        }}
        role="presentation"
      ></div>

      <div
        className="fixed w-96 z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg bg-slate-50"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
      >
        <div className="flex gap-2 items-center mb-6 bg-slate-200 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setSelectedTab("cart")}
            className={
              selectedTab === "cart"
                ? `w-1/2 py-1 text-center rounded-lg text-white bg-orange-400 transition-all ease-in-out duration-500`
                : `w-1/2 py-1 text-center rounded-lg text-orange-400 transition-all ease-in-out duration-500`
            }
          >
            Cart
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("bill")}
            className={
              selectedTab === "bill"
                ? `w-1/2 py-1 text-center text-white bg-orange-400 rounded-lg transition-all ease-in-out duration-500`
                : `w-1/2 py-1 text-center rounded-lg text-orange-400 transition-all ease-in-out duration-500`
            }
          >
            Bill
          </button>
        </div>

        <CartContent
          variant={selectedTab}
          orders={orders}
          handleSendMessages={handleSendMessages}
          pending={pending}
          statusMessage={statusMessage}
        />
      </div>
    </>
  );
};

export default CartModal;
