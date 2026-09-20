import { Euro, Utensils } from "lucide-react";

const NavTabs = ({ selected, setSelected }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${
          selected === "dineIn" && "bg-gray-500 rounded-lg"
        } flex justify-center items-center gap-1 px-2 py-1 cursor-pointer`}
        onClick={() => setSelected("dineIn")}
      >
        <Utensils className="h-5 w-5" />
        <h1 className="text-sm font-bold">Dine In</h1>
      </div>
      <div
        className={`${
          selected === "orders" && "bg-gray-500 rounded-lg"
        } flex justify-center items-center gap-1 px-2 py-1 cursor-pointer`}
        onClick={() => setSelected("orders")}
      >
        <Euro className="h-5 w-5" />
        <h1 className="text-sm font-bold">Orders</h1>
      </div>
    </div>
  );
};

export default NavTabs;
