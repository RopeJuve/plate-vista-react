import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

import Login from "./Auth/Login";
import Register from "./Auth/Register";

import {
  Navbar,
  Footer,
  Sidebar,
  ThemeSettings,
} from "../AdminComponents";
import {
  Overview,
  BestEmployees,
  TotalOrders,
  TotalIncome,
  TrendingDishes,
  DailySales,
  Calendar,
  Employees,
  Menu,
  Orders,
  Tables,
  Kanban,
} from "../../pages";

import { useStateContext } from "../../contexts/ContextProvider";

const AdminDashboard = () => {
    const { activeMenu, themeSettings, setThemeSettings, currentColor, currentMode } = useStateContext();

    return (
      <div className={currentMode === "Dark" ? "dark" : ""}>
        
          <div className="flex relative dark:bg-main-dark-bg">
            <div className="fixed right-4 bottom-4" style={{ zIndex: 1000 }}>
              <TooltipComponent content="Settings" position="Top">
                <button
                  type="button"
                  className="text-3xl p-3 hover:drop-shadow-xl hover hover:bg-light-gray text-white"
                  onClick={() => setThemeSettings(true)}
                  style={{ background: currentColor, borderRadius: "50%" }}
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
            <div
              className={
                activeMenu
                  ? "dark:bg-main-bg bg-main-bg min-h-screen md:ml-72 w-full"
                  : "dark:bg-main-bg bg-main-bg min-h-screen w-full flex-2"
              }
            >
              <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
                <Navbar />
              </div>
  
              <div>
                { themeSettings && <ThemeSettings />}
                <Routes>
                  
                  {/* Dashboard */}
                  <Route path="/" element={<Overview />} />
                  <Route path="overview" element={<Overview />} />
  
                  {/* Pages */}
                  <Route path="menu" element={<Menu />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="Tables" element={<Tables />} />
                  <Route path="Employees" element={<Employees />} />
                  
                  {/* Auth */}
                  <Route path="register" element={<Register />} />
  
                  {/* Apps */}
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="kanban" element={<Kanban />} />
  
                  {/* Charts */}
                  <Route path="dailysales" element={<DailySales />} />{/* Line Chart */}
                  <Route path="trendingdishes" element={<TrendingDishes />}/>{/* Pie Chart */}
                  <Route path="totalincome" element={<TotalIncome />} /> {/* Column Chart */}
                  <Route path="totalorders" element={<TotalOrders />} /> {/* Stacked Bar Chart */}
                  <Route path="bestemployees" element={<BestEmployees />} /> {/* Bar Chart */}
                </Routes>
              </div>
            </div>
          </div>
      </div>
    );
}

export default AdminDashboard
