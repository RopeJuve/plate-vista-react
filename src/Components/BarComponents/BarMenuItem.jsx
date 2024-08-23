import { useOrder } from "../../contexts/OrderContext";

const BarMenuItem = ({ item }) => {
  const { addOrder } = useOrder();

  const handleOrder = (item) => {
    addOrder({
      ...item,
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
