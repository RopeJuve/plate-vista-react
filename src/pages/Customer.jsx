import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NavBarCustomer from "../Components/Customer/NavBarCustomer";
import CategoriesCustomer from "../Components/Customer/CategoriesCustomer";
import MenuItemsList from "../Components/Customer/MenuItemsList";
import { Footer } from "../Components/AdminComponents";
import { fetchData } from "../services/fetchData";
import SkeletonList from "../Components/Customer/SkeletonList";
import { CartProvider } from "../contexts/CartContext";
import Cart from "../Components/Customer/Cart";
import { useWebSocketContext } from "../contexts/WebSocketContext";

const Customer = () => {
  const { tableNum, setTableNum, readyState } = useWebSocketContext();
  const [selectedCategory, setSelectedCategory] = useState("beer");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setTableNum(location.pathname.split("/")[2]);
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
      <div className="bg-slate-50 flex flex-col h-screen">
        <NavBarCustomer tableNum={tableNum} connectionStatus={readyState} />
        <CategoriesCustomer
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <div className="flex-grow overflow-hidden">
          <SkeletonList itemsCount={10} isLoading={isLoading} />
          <MenuItemsList items={items} isLoading={isLoading} />
        </div>
        <Cart />
        <Footer />
      </div>
    </CartProvider>
  );
  
};

export default Customer;
