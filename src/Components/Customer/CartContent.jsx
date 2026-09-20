import { useCart } from "../../contexts/CartContext";
import { MdPendingActions } from "react-icons/md";
import { LuAlarmClock } from "react-icons/lu";
import { PiSealCheck } from "react-icons/pi";
import { ORDER_STATUS } from "../../constants/orderStatus";

const CartContent = ({ variant, orders, handleSendMessages, pending, statusMessage }) => {
  const { cart, clearCart } = useCart();
  const price = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalOrderPrice = orders?.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

  return (
    <>
      {variant === "cart" && (
        <div className="mt-4 max-h-[50vh] overflow-hidden">
          {statusMessage && (
            <p className="text-center h-[5rem]">{statusMessage}</p>
          )}
          {cart.length === 0 && !statusMessage && (
            <p className="text-center h-[5rem]">Cart is empty</p>
          )}
          {cart.map((item) => (
            <div key={item._id} className="flex gap-4 items-center border-b border-gray-200 py-2">
              <p className="w-2/3 font-semibold">{item.title}</p>
              <p className="flex-grow">{item.quantity}</p>
              <p className="font-semibold">{(item.price * item.quantity).toFixed(2)}€</p>
            </div>
          ))}
          <div className="flex justify-between items-center mt-4">
            <h3 className="text-xl font-semibold">Total</h3>
            <h3 className="font-semibold">{price.toFixed(2)}€</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="bg-orange-400 text-white w-full py-2 mt-6 rounded-lg disabled:opacity-50"
              onClick={handleSendMessages}
              disabled={cart.length === 0 || pending}
            >
              {pending ? "Placing..." : "Order Now"}
            </button>
            <button
              type="button"
              className="bg-red-400 text-white w-full py-2 mt-6 rounded-lg disabled:opacity-50"
              onClick={clearCart}
              disabled={cart.length === 0 || pending}
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
      {variant === "bill" && (
        <>
          <div className="mt-4 max-h-[50vh] overflow-y-scroll">
            {orders?.map((order) => (
              <div key={order._id} className="px-1 mb-1 mr-1 rounded-lg border">
                {order.menuItems?.map((menuItem) => (
                  <div key={menuItem._id} className="flex gap-4 items-center border-b border-gray-200 py-2">
                    <p className="w-2/3 font-semibold">{menuItem.product?.title}</p>
                    <p className="flex-grow">{menuItem.quantity}</p>
                    <p className="font-semibold">{(menuItem.product?.price * menuItem.quantity).toFixed(2)}€</p>
                  </div>
                ))}
                {order?.orderStatus === ORDER_STATUS.PENDING && (
                  <span className="inline-flex items-center gap-1 opacity-70 text-[0.725rem] italic text-yellow-500">
                    <LuAlarmClock /> {order.orderStatus}
                  </span>
                )}
                {order?.orderStatus === ORDER_STATUS.PROCESSING && (
                  <span className="inline-flex items-center gap-1 opacity-70 text-[0.725rem] italic text-blue-500">
                    <MdPendingActions /> {order.orderStatus}
                  </span>
                )}
                {order?.orderStatus === ORDER_STATUS.COMPLETE && (
                  <span className="inline-flex items-center gap-1 opacity-70 text-[0.725rem] italic text-green-500">
                    <PiSealCheck /> {order.orderStatus}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <h3 className="text-xl font-semibold">Total</h3>
            <h3 className="font-semibold">{totalOrderPrice?.toFixed(2)}€</h3>
          </div>
          <button className="bg-blue-400 text-white w-full py-2 mt-6 rounded-lg" onClick={clearCart}>
            Call Waiter
          </button>
        </>
      )}
    </>
  );
};

export default CartContent;
