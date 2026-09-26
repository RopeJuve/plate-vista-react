import { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { checkCart } from "../../features/guest-ordering/cartLimits";
import { useGuestBill } from "../../features/guest-ordering/GuestBillProvider";
import { usePlaceOrder } from "../../features/guest-ordering/usePlaceOrder";
import { invalidatePendingIfCartChanged, toOrderItems } from "../../features/guest-ordering/pendingOrder";
import { errorMessage } from "../../shared/realtime/errorMessages";
import { useGuestAuth } from "../../features/guest-ordering/GuestAuthContext";
import CartContent from "./CartContent";

const CartModal = ({ closeModal }: { closeModal: (open: boolean) => void }) => {
  const { session } = useGuestAuth();
  const { cart, clearCart } = useCart();
  const { itemsById } = useMenu();
  const { rememberOrder } = useGuestBill();
  const storageKey = `guest:${session?.sessionId || "unknown"}`;
  const { phase, error, fieldErrors, outOfStockIds, submit, resetPhase, canSend } = usePlaceOrder(storageKey);
  const [selectedTab, setSelectedTab] = useState("cart");
  const issues = checkCart(cart, itemsById);
  const highlighted = [...new Set([...issues.unavailableIds, ...outOfStockIds])];

  useEffect(() => {
    invalidatePendingIfCartChanged(storageKey, toOrderItems(cart));
    if (cart.length === 0 && phase === "success") {
      resetPhase();
    }
  }, [cart, phase, resetPhase, storageKey]);

  const handleSendMessages = async () => {
    if (phase === "sending" || issues.blocking || cart.length === 0) {
      return;
    }
    try {
      const order = await submit(toOrderItems(cart));
      rememberOrder(order);
      clearCart();
    } catch {
      // phase is already "error"
    }
  };

  const statusMessage = !canSend
    ? "Connecting…"
    : phase === "sending"
      ? "Placing order…"
      : phase === "success"
        ? "Order placed"
        : error
          ? errorMessage(error.code, error.details, error.message)
          : issues.messages[0] || "";

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50"
        onClick={() => closeModal(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeModal(false);
          }
        }}
        role="presentation"
      ></div>
      <div
        className="fixed top-1/2 left-1/2 z-50 w-96 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-50 p-4"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
      >
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-slate-200 p-1">
          <button
            type="button"
            onClick={() => setSelectedTab("cart")}
            className={
              selectedTab === "cart"
                ? "w-1/2 rounded-lg bg-orange-400 py-1 text-center text-white"
                : "w-1/2 rounded-lg py-1 text-center text-orange-400"
            }
          >
            Cart
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("bill")}
            className={
              selectedTab === "bill"
                ? "w-1/2 rounded-lg bg-orange-400 py-1 text-center text-white"
                : "w-1/2 rounded-lg py-1 text-center text-orange-400"
            }
          >
            Bill
          </button>
        </div>
        <CartContent
          variant={selectedTab}
          handleSendMessages={handleSendMessages}
          pending={phase === "sending"}
          statusMessage={statusMessage}
          canSend={canSend}
          blocking={issues.blocking}
          highlightedIds={highlighted}
          fieldErrors={fieldErrors}
          phase={phase}
        />
      </div>
    </>
  );
};

export default CartModal;
