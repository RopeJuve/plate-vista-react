import { useCart } from "../../contexts/CartContext";

const CartModal = ({ items }) => {
  const { clearCart } = useCart();
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50"></div>
      <div className="fixed w-96 h-96 bg-white z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4  rounded-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Cart</h2>
          <button onClick={clearCart} className="text-red-500">
            Clear
          </button>
        </div>
        <div className="mt-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center border-b border-gray-200 py-2"
            >
              <p>{item.title}</p>
              <p>{item.quantity}</p>
              <p>{item.price * item.quantity}€</p>  
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CartModal;
