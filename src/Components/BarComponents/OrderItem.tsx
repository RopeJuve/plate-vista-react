import { Euro } from "lucide-react";

const OrderItem = ({ item }) => {
  return (
    <div className="space-y-1 w-[80%]">
      {(item.menuItems || []).map((menuItem) => (
        <div
          className="font-semibold flex items-center gap-2"
          key={menuItem._id}
        >
          <div className="flex-grow">
            {menuItem.product?.title} ({menuItem.quantity})
          </div>
          <span className="flex items-center gap-1 px-1 border border-gray-300 rounded-2xl text-sm font-bold">
            <Euro className="h-5 w-5 inline-block text-gray-300" />
            {menuItem.product?.price}€
          </span>
        </div>
      ))}
    </div>
  );
};

export default OrderItem;
