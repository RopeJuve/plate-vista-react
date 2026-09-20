import { useEffect, useState } from "react";
import api from "../../services/api";
import BarMenuItem from "./BarMenuItem";
import { notify } from "../../utils/notify";

const BarMenuItems = ({ category }) => {
  const [menuItems, setMenuItems] = useState([]);
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data } = await api.get("/menu-items", {
          params: { category },
        });
        setMenuItems(data);
      } catch (error) {
        notify(error.response?.data?.message || "Could not load menu items");
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


