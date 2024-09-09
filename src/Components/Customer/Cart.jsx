import { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { MdOutlineShoppingCart } from "react-icons/md";
import CartModal from "./CartModal";

const Cart = () => {
  const { cart } = useCart();
  const [showCart, setShowCart] = useState(false);
  return (
    <>
      {cart.length > 0 && (
        <div
          className="fixed bottom-[1rem] right-[0.5rem] z-50 w-10 h-10 rounded-full cursor-pointer bg-orange-400 p-8"
          onClick={() => setShowCart(!showCart)}
        >
          <MdOutlineShoppingCart className="text-white w-8 h-8 translate-x-[-50%] translate-y-[-50%]" />
          {showCart && <CartModal items={cart} />}
        </div>
      )}
    </>
  );
};

export default Cart;
