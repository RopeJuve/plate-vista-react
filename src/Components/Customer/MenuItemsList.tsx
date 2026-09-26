import MenuItemCard from "./MenuItemCard";
import type { MenuRecord } from "../../features/guest-ordering/menu";

const MenuItemsList = ({ items, isLoading }: { items: MenuRecord[]; isLoading: boolean }) => {
  return (
    <div className="mt-6 h-full w-full overflow-y-auto px-6 pb-24">
      <div className="grid grid-flow-row auto-rows-max grid-cols-card gap-3">
        {!isLoading && items.map((item) => <MenuItemCard key={item._id} item={item} />)}
      </div>
    </div>
  );
};

export default MenuItemsList;
