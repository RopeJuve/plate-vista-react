
import MenuItemCard from "./MenuItemCard";

const MenuItemsList = ({ items }) => {
  return (
    <div className="px-6 mt-6  grid grid-flow-row auto-rows-max grid-cols-card gap-3">
        {items?.map(item => (
            <MenuItemCard key={item._id} item={item} />
        ) )}
    </div>
  )
}

export default MenuItemsList