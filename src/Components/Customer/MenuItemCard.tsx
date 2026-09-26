import { ShoppingCart } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useStateContext } from "../../contexts/ContextProvider";
import type { MenuRecord } from "../../features/guest-ordering/menu";
import { formatCents } from "../../shared/money/formatCents";

const MenuItemCard = ({ item }: { item: MenuRecord }) => {
  const { addLine } = useCart();
  const { currentColor, currentMode } = useStateContext();
  const unavailable = !item.inStock || item.archived;

  return (
    <div
      className={`flex items-center gap-4 rounded-lg px-2 py-4 shadow-md ${
        currentMode === "Dark" ? "bg-gray-500 text-white" : "bg-white text-black"
      } ${unavailable ? "opacity-60" : ""}`}
    >
      <div className="h-16 w-16 flex-shrink-0 rounded-lg">
        {item.image ? (
          <img src={item.image} alt={item.title} className="h-full w-full rounded-lg object-cover" />
        ) : (
          <div className="h-full w-full rounded-lg bg-slate-200" />
        )}
      </div>
      <div className="flex flex-grow flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between">
          <h3 className="text-base font-semibold">{item.title}</h3>
          <p className="text-base font-semibold">{formatCents(item.priceCents)}</p>
        </div>
        {item.description && <p className="max-w-[85%] text-[0.725rem] text-pretty text-gray-500">{item.description}</p>}
        {unavailable && <p className="text-sm text-red-600">Out of stock</p>}
        <button
          type="button"
          className="h-11 w-11 self-end"
          onClick={() => addLine(item._id)}
          disabled={unavailable}
          aria-label={`Add ${item.title} to cart`}
        >
          <ShoppingCart className="h-6 w-6" style={{ color: currentColor }} />
        </button>
      </div>
    </div>
  );
};

export default MenuItemCard;
