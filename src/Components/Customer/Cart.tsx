import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import CartModal from "./CartModal";
import { useStateContext } from "../../contexts/ContextProvider";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { formatCents, lineTotalCents, sumCents } from "../../shared/money/formatCents";

const Cart = () => {
  const { cart } = useCart();
  const { itemsById } = useMenu();
  const [showCart, setShowCart] = useState(false);
  const { currentColor } = useStateContext();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCents = sumCents(
    cart.map((line) => lineTotalCents(itemsById[line.productId]?.priceCents ?? 0, line.quantity))
  );

  return (
    <>
      <button
        type="button"
        className="fixed bottom-4 right-4 z-40 flex min-h-14 items-center gap-3 rounded-full px-5 py-3 text-white shadow-lg"
        style={{ background: currentColor }}
        onClick={() => setShowCart(true)}
        aria-label={`Open cart, ${count} items, ${formatCents(totalCents)}`}
      >
        <ShoppingCart className="h-7 w-7" />
        <span className="text-sm font-semibold">{count}</span>
        <span className="text-sm font-semibold">{formatCents(totalCents)}</span>
      </button>
      {showCart && <CartModal closeModal={setShowCart} />}
    </>
  );
};

export default Cart;
