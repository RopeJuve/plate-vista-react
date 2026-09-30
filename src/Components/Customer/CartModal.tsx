import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { checkCart } from "../../features/guest-ordering/cartLimits";
import { useGuestBill } from "../../features/guest-ordering/GuestBillProvider";
import { usePlaceOrder } from "../../features/guest-ordering/usePlaceOrder";
import { invalidatePendingIfCartChanged, toOrderItems } from "../../features/guest-ordering/pendingOrder";
import { errorMessage } from "../../shared/realtime/errorMessages";
import type { Order } from "../../shared/realtime/protocol";
import { useGuestAuth } from "../../features/guest-ordering/GuestAuthContext";
import CartContent from "./CartContent";
import { cn } from "@/lib/utils";

const CartModal = ({ closeModal }: { closeModal: (open: boolean) => void }) => {
  const { session } = useGuestAuth();
  const { cart, clearCart } = useCart();
  const { itemsById } = useMenu();
  const { orders, rememberOrder } = useGuestBill();
  const storageKey = `guest:${session?.sessionId || "unknown"}`;
  const handlePlaced = useCallback(
    (order: Order) => {
      rememberOrder(order);
      clearCart();
    },
    [clearCart, rememberOrder]
  );
  const { phase, error, fieldErrors, outOfStockIds, submit, resetPhase, canSend } = usePlaceOrder(
    storageKey,
    handlePlaced
  );
  const [selectedTab, setSelectedTab] = useState("cart");
  const issues = checkCart(cart, itemsById);
  const highlighted = [...new Set([...issues.unavailableIds, ...outOfStockIds])];
  const sheetRef = useRef<HTMLDivElement>(null);
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const billCount = orders.filter((order) => order.status !== "cancelled").length;

  useEffect(() => {
    invalidatePendingIfCartChanged(storageKey, toOrderItems(cart));
    if (cart.length === 0 && phase === "success") {
      resetPhase();
    }
  }, [cart, phase, resetPhase, storageKey]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeModal]);

  const handleSendMessages = async () => {
    if (phase === "sending" || issues.blocking || cart.length === 0) {
      return;
    }
    try {
      // The cart and bill are settled by handlePlaced, so a retried order
      // lands the same way as one accepted on the first try.
      await submit(toOrderItems(cart));
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

  const tabs = [
    { id: "cart", label: "Cart", count: cartCount },
    { id: "bill", label: "Bill", count: billCount },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-steel-950/55 backdrop-blur-[2px] animate-in fade-in-0"
        onClick={() => closeModal(false)}
        role="presentation"
      />
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl bg-paper text-ink shadow-[0_-20px_50px_-12px_rgb(0_0_0/0.45)] outline-none",
          "animate-in slide-in-from-bottom-8 fade-in-0 duration-300",
          "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[28rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:slide-in-from-bottom-4"
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-ink/15 sm:hidden" aria-hidden="true" />
        <div className="flex items-center gap-3 px-4 pb-2 pt-3">
          <div className="flex flex-1 rounded-lg bg-ink/[0.06] p-1" role="group" aria-label="Order and bill">
            {tabs.map((tab) => {
              const active = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedTab(tab.id)}
                  className={cn(
                    "flex h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm font-bold transition-colors",
                    active ? "bg-white text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12)]" : "text-ink/60 hover:text-ink"
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "min-w-[1.25rem] rounded-full px-1.5 font-mono text-xs tabular",
                        active ? "bg-signal text-ink" : "bg-ink/10"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => closeModal(false)}
            className="grid h-10 w-10 place-items-center rounded-md text-ink/60 hover:bg-ink/[0.06] hover:text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
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
