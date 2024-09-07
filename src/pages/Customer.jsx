import { useEffect, useState } from "react";
import NavBarCustomer from "../Components/Customer/NavBarCustomer";
import CategoriesCustomer from "../Components/Customer/CategoriesCustomer";
import MenuItemsList from "../Components/Customer/MenuItemsList";
import { Footer } from "../Components/AdminComponents";
import { fetchData } from "../services/fetchData";

const Customer = () => {
  const [selectedCategory, setSelectedCategory] = useState("beer");
  const [items, setItems] = useState([]);
  useEffect( () => {
    const getItems = async () => {
      const { data } = await fetchData(
        `${import.meta.env.VITE_VERCEL_API_URL}/menu-items?category=${selectedCategory}`
      );
      setItems(data);
    }
    getItems();
  }, [selectedCategory]);
  return (
    <div className="max-w-screen-xl mx-auto">
      <NavBarCustomer />
      <CategoriesCustomer selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      <MenuItemsList items={items} />
      <Footer />
    </div>
  );
};

export default Customer;
