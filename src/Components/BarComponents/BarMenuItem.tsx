import { useOrder } from "../../contexts/OrderContext";
import type { MenuRecord } from "../../features/guest-ordering/menu";

const BarMenuItem = ({ item }: { item: MenuRecord }) => {
  const { addOrder } = useOrder();

  return (
    <button
      type="button"
      className="rounded-lg bg-secondary-dark-bg disabled:opacity-40"
      onClick={() => addOrder(item._id)}
      disabled={!item.inStock || item.archived}
    >
      {item.title}
    </button>
  );
};

export default BarMenuItem;
