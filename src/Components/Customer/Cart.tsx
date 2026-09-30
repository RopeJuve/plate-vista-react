import { useState } from "react";
import { ChevronRight, ReceiptText } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import CartModal from "./CartModal";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { useGuestBill } from "../../features/guest-ordering/GuestBillProvider";
import { formatCents, lineTotalCents, sumCents } from "../../shared/money/formatCents";

const Cart = () => {
  const { cart } = useCart();
  const { itemsById } = useMenu();
  const { orders } = useGuestBill();
  const [showCart, setShowCart] = useState(false);
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCents = sumCents(
    cart.map((line) => lineTotalCents(itemsById[line.productId]?.priceCents ?? 0, line.quantity))
  );
  const hasBill = orders.some((order) => order.status !== "cancelled");

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-3xl justify-end px-3 sm:px-6">
          {count > 0 ? (
            <button
              type="button"
              className="print-in pointer-events-auto flex h-16 w-full items-center gap-3 rounded-2xl bg-ink pl-4 pr-3 text-paper shadow-[0_16px_40px_-10px_rgb(0_0_0/0.55)] transition-transform active:scale-[0.99]"
              onClick={() => setShowCart(true)}
              aria-label={`Open cart, ${count} items, ${formatCents(totalCents)}`}
            >
              <span className="grid h-9 min-w-[2.25rem] place-items-center rounded-lg bg-signal px-2 font-mono text-base font-bold text-ink tabular">
                {count}
              </span>
              <span className="text-base font-bold">View order</span>
              <span className="ml-auto font-mono text-base font-bold tabular">{formatCents(totalCents)}</span>
              <ChevronRight className="h-5 w-5 text-paper/60" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="pointer-events-auto flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-paper shadow-[0_12px_30px_-10px_rgb(0_0_0/0.5)]"
              onClick={() => setShowCart(true)}
              aria-label={`Open cart, ${count} items, ${formatCents(totalCents)}`}
            >
              <ReceiptText className="h-4 w-4" aria-hidden="true" />
              {hasBill ? "Your bill" : "Your order"}
            </button>
          )}
        </div>
      </div>
      {showCart && <CartModal closeModal={setShowCart} />}
    </>
  );
};

export default Cart;
