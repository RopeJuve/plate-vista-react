import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom";
import "./index.css";
import PrivateRoute from "./pages/PrivateRoute";
import { OrderProvider } from "./contexts/OrderContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import ErrorBoundary from "./Components/ErrorBoundary";
import Loading from "./pages/Loading";

const Login = lazy(() => import("./Components/AdminComponents/Auth/Login"));
const AdminDashboard = lazy(() => import("./Components/AdminComponents/AdminDashboard"));
const Overview = lazy(() => import("./pages/Overview"));
const Menu = lazy(() => import("./pages/Menu"));
const Orders = lazy(() => import("./pages/Orders"));
const Tables = lazy(() => import("./pages/Tables"));
const Employees = lazy(() => import("./pages/Employees"));
const Register = lazy(() => import("./Components/AdminComponents/Auth/Register"));
const QRCodeGenerator = lazy(() => import("./pages/QRCodeGenerator"));
const DailySales = lazy(() => import("./pages/DailySales"));
const TrendingDishes = lazy(() => import("./pages/TrendingDishes"));
const TotalIncome = lazy(() => import("./pages/TotalIncome"));
const TotalOrders = lazy(() => import("./pages/TotalOrders"));
const BestEmployees = lazy(() => import("./pages/BestEmployees"));
const BarPage = lazy(() => import("./pages/BarPage"));
const BarPageTableView = lazy(() => import("./pages/BarPageTableView"));
const Customer = lazy(() => import("./pages/Customer"));

const BarLayout = () => {
  const location = useLocation();
  const context = useOutletContext();
  return (
    <ErrorBoundary key={location.pathname}>
      <Outlet context={context} />
    </ErrorBoundary>
  );
};

function App() {
  return (
    <div>
      <OrderProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <WebSocketProvider>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/register" element={<Navigate to="/" replace />} />
                  <Route
                    path="/admin"
                    element={<PrivateRoute allowedRoles={["admin"]} />}
                  >
                    <Route element={<AdminDashboard />}>
                      <Route index element={<Overview />} />
                      <Route path="overview" element={<Overview />} />
                      <Route path="Overview" element={<Overview />} />
                      <Route path="menu" element={<Menu />} />
                      <Route path="Menu" element={<Menu />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="Orders" element={<Orders />} />
                      <Route path="tables" element={<Tables />} />
                      <Route path="Tables" element={<Tables />} />
                      <Route path="employees" element={<Employees />} />
                      <Route path="Employees" element={<Employees />} />
                      <Route path="register" element={<Register />} />
                      <Route path="QRCodeGenerator" element={<QRCodeGenerator />} />
                      <Route path="dailysales" element={<DailySales />} />
                      <Route path="DailySales" element={<DailySales />} />
                      <Route path="trendingdishes" element={<TrendingDishes />} />
                      <Route path="TrendingDishes" element={<TrendingDishes />} />
                      <Route path="totalincome" element={<TotalIncome />} />
                      <Route path="TotalIncome" element={<TotalIncome />} />
                      <Route path="totalorders" element={<TotalOrders />} />
                      <Route path="TotalOrders" element={<TotalOrders />} />
                      <Route path="bestemployees" element={<BestEmployees />} />
                      <Route path="BestEmployees" element={<BestEmployees />} />
                    </Route>
                  </Route>
                  <Route
                    path="/bar"
                    element={<PrivateRoute allowedRoles={["bar", "kitchen"]} />}
                  >
                    <Route element={<BarLayout />}>
                      <Route index element={<BarPageTableView />} />
                      <Route path="table/:tableId" element={<BarPage />} />
                      <Route path="Table/:tableId" element={<BarPage />} />
                    </Route>
                  </Route>
                  <Route path="/table/:tableId" element={<Customer />} />
                  <Route path="/:restaurantId" element={<Login />} />
                </Routes>
              </Suspense>
            </WebSocketProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </OrderProvider>
    </div>
  );
}

export default App;
