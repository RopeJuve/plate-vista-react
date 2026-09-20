import { useOrder } from "../../contexts/OrderContext";
import { MenuItem } from "../../types";

const BarMenuItem = ({ item }: { item: MenuItem }) => {
  const { addOrder } = useOrder();

  const handleOrder = (menuItem: MenuItem) => {
    addOrder({
      ...menuItem,
      quantity: 1,
    });
  };

  return (
    <button className="bg-secondary-dark-bg rounded-lg" onClick={() => handleOrder(item)}>
      {item.title}
    </button>
  );
};

export default BarMenuItem;
