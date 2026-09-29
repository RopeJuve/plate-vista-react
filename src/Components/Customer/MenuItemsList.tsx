import MenuItemCard from "./MenuItemCard";
import type { MenuRecord } from "../../features/guest-ordering/menu";

const MenuItemsList = ({
  items,
  isLoading,
  heading,
  emptyMessage = "Nothing here yet.",
}: {
  items: MenuRecord[];
  isLoading: boolean;
  heading?: string;
  emptyMessage?: string;
}) => {
  if (isLoading) {
    return null;
  }
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      {heading && (
        <h2 className="pt-2 text-2xl font-extrabold capitalize tracking-[-0.02em]">{heading}</h2>
      )}
      {items.map((item) => (
        <MenuItemCard key={item._id} item={item} />
      ))}
      {items.length === 0 && <p className="py-12 text-center text-ink-soft">{emptyMessage}</p>}
    </div>
  );
};

export default MenuItemsList;
