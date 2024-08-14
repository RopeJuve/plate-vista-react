import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import MenuNav from "./Components/MenuNav";
import MenuGrid from "./Components/MenuGrid";
import Cart from ".//Components/Cart";
import OrderSummary from "./Components/OrderSummary";
import Checkout from "./Components/Checkout";
import OrderConfirmation from "./Components/OrderConfirmation";

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

  return (
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
  );
}

export default App;
