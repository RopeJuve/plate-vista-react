import { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { MdOutlineShoppingCart } from "react-icons/md";
import CartModal from "./CartModal";
import { useStateContext } from "../../contexts/ContextProvider"; 

const Cart = () => {
  const { cart } = useCart();
  const [showCart, setShowCart] = useState(false);
  const { currentColor } = useStateContext();
  return (
    <>
       <div
          className="fixed bottom-[1rem] right-[0.5rem] z-50 w-10 h-10 rounded-full cursor-pointer p-7 shadow-bg-light-gray shadow-lg"
          style={{ background: currentColor }}
          onClick={() => setShowCart(!showCart)}
        >
          <MdOutlineShoppingCart className="text-white w-8 h-8 translate-x-[-50%] translate-y-[-50%] relative" />
          {cart.length > 0 && (<div
            className="absolute z-[50] top-0 right-0 text-[0.725rem] bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center"
          >{cart.length}</div>)}
          {showCart && <CartModal items={cart} closeModal={setShowCart} />}
        </div>
    </>
  );
};

export default Cart;
