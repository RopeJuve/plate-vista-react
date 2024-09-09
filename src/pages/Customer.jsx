import { useEffect, useState } from "react";
import NavBarCustomer from "../Components/Customer/NavBarCustomer";
import CategoriesCustomer from "../Components/Customer/CategoriesCustomer";
import MenuItemsList from "../Components/Customer/MenuItemsList";
import { Footer } from "../Components/AdminComponents";
import { fetchData } from "../services/fetchData";
import SkeletonList from "../Components/Customer/SkeletonList";
import { CartProvider } from "../contexts/CartContext";
import Cart from "../Components/Customer/Cart";

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
    <CartProvider>
      <div className=" bg-slate-50">
      <div className="max-w-screen-xl mx-auto">
        <NavBarCustomer />
        <CategoriesCustomer
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <SkeletonList itemsCount={10} isLoading={isLoading} />
        <MenuItemsList items={items} isLoading={isLoading} />
        <Cart />
        <Footer />
      </div>
      </div>
    </CartProvider>
    
  );
};

export default Customer;
