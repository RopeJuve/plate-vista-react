import { useEffect, useState } from "react";
import NavBarCustomer from "../Components/Customer/NavBarCustomer";
import CategoriesCustomer from "../Components/Customer/CategoriesCustomer";
import MenuItemsList from "../Components/Customer/MenuItemsList";
import { Footer } from "../Components/AdminComponents";
import { fetchData } from "../services/fetchData";
import SkeletonList from "../Components/Customer/SkeletonList";

const Customer = () => {
  const [selectedCategory, setSelectedCategory] = useState("beer");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const getItems = async () => {
      try {
        setIsLoading(true);
        const { data } = await fetchData(
          `${
            import.meta.env.VITE_VERCEL_API_URL
          }/menu-items?category=${selectedCategory}`
        );
        setItems(data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(tru);
        console.error(error);
      }
    };
    getItems();
  }, [selectedCategory]);
  return (
    <div className="max-w-screen-xl mx-auto">
      <NavBarCustomer />
      <CategoriesCustomer
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <SkeletonList itemsCount={10} isLoading={isLoading} />
      <MenuItemsList items={items} isLoading={isLoading}/>
      <Footer />
    </div>
  );
};

export default Customer;
