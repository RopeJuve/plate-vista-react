import { useEffect, useState } from "react";
import NavBarCustomer from "../Components/Customer/NavBarCustomer";
import CategoriesCustomer from "../Components/Customer/CategoriesCustomer";
import MenuItemsList from "../Components/Customer/MenuItemsList";
import { Footer } from "../Components/AdminComponents";
import api from "../services/api";
import SkeletonList from "../Components/Customer/SkeletonList";
import { CartProvider } from "../contexts/CartContext";
import Cart from "../Components/Customer/Cart";
import { useWebSocketContext } from "../contexts/WebSocketContext";
import { useStateContext } from "../contexts/ContextProvider";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { FiSettings } from "react-icons/fi";
import ThemeSettings from "../Components/AdminComponents/ThemeSettings";

const Customer = () => {
  const { tableNum, readyState, tableError } = useWebSocketContext();
  const [selectedCategory, setSelectedCategory] = useState("beer");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { themeSettings, setThemeSettings, currentMode, currentColor } =
    useStateContext();

  useEffect(() => {
    const getItems = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("/menu-items", {
          params: { category: selectedCategory },
        });
        setItems(data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(true);
        console.error(error);
      }
    };
    getItems();
  }, [selectedCategory]);

  if (tableError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="text-lg font-semibold text-gray-800" role="alert">
          {tableError}
        </p>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className={currentMode === "Dark" ? "dark" : ""}>
        <div className="bg-slate-50 dark:bg-main-dark-bg flex flex-col h-screen relative">
          <div className="fixed right-2 bottom-20" style={{ zIndex: 1000 }}>
            <TooltipComponent content="Settings" position="Top">
              <button
                type="button"
                className="text-3xl p-3 hover:drop-shadow-xl hover:bg-light-gray text-white"
                onClick={() => setThemeSettings(true)}
                style={{ background: currentColor, borderRadius: "50%" }}
              >
                <FiSettings />
              </button>
            </TooltipComponent>
          </div>

          {themeSettings && <ThemeSettings />}

          <NavBarCustomer tableNum={tableNum} connectionStatus={readyState} />
          {/* Commented this out below because I get the categories in the Customer Page in the UItwice otherwise */}
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
      </div>
    </CartProvider>
  );
};

export default Customer;
