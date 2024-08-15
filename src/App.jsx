import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import MenuNav from "./Components/MenuNav";
import MenuGrid from "./Components/MenuGrid";
import Cart from ".//Components/Cart";
import OrderSummary from "./Components/OrderSummary";
import Checkout from "./Components/Checkout";
import OrderConfirmation from "./Components/OrderConfirmation";

import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

import { Navbar, Footer, Sidebar, ThemeSettings } from "./components";
import { Overview, BestEmployees, TotalOrders, TotalIncome, TrendingDishes, DailySales, Calendar, Employees, Menu, Orders, Tables } from "./pages";


function App() {
  const [darkMode, setDarkMode] = useState(true); // Set darkMode to true by default
  const [checkoutStep, setCheckoutStep] = useState("cart"); // 'cart', 'checkout', or 'confirmation'
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleProceedToCheckout = () => {
    setCheckoutStep("checkout");
  };

  const handleOrderSubmit = (details) => {
    setOrderDetails(details);
    setCheckoutStep("confirmation");
  };

  const activeMenu = true;

  return (
    <div>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header toggleDarkMode={toggleDarkMode} />
        <div className="flex">
          <div className="flex-1">
            <MenuNav />
            <main className="p-4">
              {checkoutStep === "cart" && <MenuGrid />}
              {checkoutStep === "checkout" && (
                <Checkout onSubmit={handleOrderSubmit} />
              )}
              {checkoutStep === "confirmation" && orderDetails && (
                <OrderConfirmation orderDetails={orderDetails} />
              )}
            </main>
          </div>
          <aside className="w-1/4 p-8">
            <Cart />
            {checkoutStep === "cart" && (
              <div className="mt-4">
                <OrderSummary />
                <button
                  onClick={handleProceedToCheckout}
                  className="bg-green-500 text-white p-2 rounded w-full mt-4"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
      <BrowserRouter>
        <div className="flex relative dark:bg-main-dark-bg">
          <div className="fixed right-4 bottom-4" style={{ zIndex: 1000 }}>
            <TooltipComponent content="Settings" position="Top">
              <button
                type="button"
                className="text-3xl p-3 hover:drop-shadow-xl hover hover:bg-light-gray text-white"
                style={{ background: "blue", borderRadius: "50%" }}
              >
                <FiSettings />
              </button>
            </TooltipComponent>
          </div>
          {activeMenu ? (
            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
              <Sidebar />
            </div>
          ) : (
            <div className="w-0 bg-secondary-dark-bg">
              <Sidebar />
            </div>
          )}
          <div className={
            activeMenu ? 'dark:bg-main-bg bg-main-bg min-h-screen md:ml-72 w-full' :
              'dark:bg-main-bg bg-main-bg min-h-screen w-full flex-2'
          }>
            <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
              <Navbar />
            </div>
          </div>

          <div>
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<Overview />} />
              <Route path="/overview" element={<Overview />} />

              {/* Pages */}
              <Route path="/menu" element={<Menu />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/Tables" element={<Tables />} />
              <Route path="/Employees" element={<Employees />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Apps */}
              <Route path="/calendar" element={<Calendar />} />

              {/* Charts */}
              <Route path="/dailysales" element={<DailySales />} /> {/* Line Chart */}
              <Route path="/trendingdishes" element={<TrendingDishes />} /> {/* Pie Chart */}
              <Route path="/totalincome" element={<TotalIncome />} /> {/* Column Chart */}
              <Route path="/totalorders" element={<TotalOrders />} /> {/* Stacked Bar Chart */}
              <Route path="/bestemployees" element={<BestEmployees />} /> {/* Bar Chart */}
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
