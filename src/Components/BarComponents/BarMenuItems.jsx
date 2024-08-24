import { useEffect, useState } from "react";
import { fetchData } from "../../services/fetchData";
import BarMenuItem from "./BarMenuItem";

const BarMenuItems = ({ category }) => {
  const [menuItems, setMenuItems] = useState([]);
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data } = await fetchData(
          `${
            import.meta.env.VITE_VERCEL_API_URL
          }/menu-items?category=${category}`
        );
        setMenuItems(data);
      } catch (error) {
        console.log("Error fetching menu items", error);
      }
    };
    fetchMenuItems();
  }, [category]);

  return (
    <div className="col-span-3 bg-main-dark-bg rounded-lg">
      <h2 className="text-2xl text-center uppercase font-semibold bg-main-dark-bg pb-1">
        {category}
      </h2>
      <div className="bar-menu-item-container text-center">
        {menuItems.length != 0 && menuItems.map((menuItem) => (
          <BarMenuItem key={`${menuItem._id}`} item={menuItem} />
        ))}
      </div>
    </div>
  );
};

export default BarMenuItems;


