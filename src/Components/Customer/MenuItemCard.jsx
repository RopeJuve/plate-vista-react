import { useState } from "react";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import { useCart } from "../../contexts/CartContext";

const MenuItemCard = ({ item }) => {
  const [showMore, setShowMore] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  return (
    <div className="flex items-center gap-4 shadow-md rounded-lg py-4 px-2 bg-white">
      <div className="w-16 h-16 rounded-lg flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex flex-col gap-1 flex-grow">
        <div className="flex items-center justify-between flex-wrap">
          <h3 className="font-semibold text-base flex-shrink-0">{item.title}</h3>
          <p className="font-semibold text-base">{item.price}€</p>
        </div>
        <p className="text-gray-500 text-[0.725rem] text-pretty max-w-[85%]">
          {showMore
            ? item.description
            : `${item.description.substring(0, 35)}...`}
          <button
            className="text-orange-400 ml-1 font-semibold"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "Less" : "More"}
          </button>
        </p>
        <button className="self-end w-6 h-6" onClick={() => addToCart({
          ...item,
          quantity,
          price: item.price * quantity,
        })}>
          <MdOutlineAddShoppingCart className="w-full h-full text-orange-400" />
        </button>
      </div>
    </div>
  );
};

export default MenuItemCard;
