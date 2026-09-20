import MenuItemCard from "./MenuItemCard";
import { MenuItem } from "../../types";

const MenuItemsList = ({ items, isLoading }: { items: MenuItem[]; isLoading: boolean }) => {
  return (
    <div className="px-6 mt-6 w-full h-full pb-16 overflow-y-auto">
      <div className="grid grid-flow-row auto-rows-max grid-cols-card gap-3">
        {!isLoading && items.map((item) => (
          <MenuItemCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MenuItemsList;
