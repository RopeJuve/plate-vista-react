import { IoFastFoodOutline } from "react-icons/io5";
import { RiMoneyEuroCircleLine } from "react-icons/ri";

const NavTabs = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex justify-center items-center gap-1 px-2 py-1 bg-gray-500 rounded-lg cursor-pointer">
        <IoFastFoodOutline className="text-lg" />
        <h1 className="text-sm font-bold">Dine In</h1>
      </div>
      <div className="flex justify-center items-center gap-1">
        <RiMoneyEuroCircleLine className="text-lg" />
        <h1 className="text-sm font-bold">Orders</h1>
      </div>
    </div>
  );
};

export default NavTabs;
