import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import "./index.css";
import PrivateRoute from "./pages/PrivateRoute";
import { GuestAuthProvider } from "./features/guest-ordering/GuestAuthContext";
import { MenuProvider } from "./features/guest-ordering/MenuProvider";
import { StaffBoardProvider } from "./features/staff-board/StaffBoardProvider";
import { RealtimeProvider } from "./shared/realtime/RealtimeProvider";
import ErrorBoundary from "./Components/ErrorBoundary";
import Loading from "./pages/Loading";
import { getLoginPath } from "./shared/auth/loginPaths";

const Login = lazy(() => import("./Components/AdminComponents/Auth/Login"));
const StaffLogin = lazy(() => import("./Components/AdminComponents/Auth/StaffLogin"));
const RestaurantRegister = lazy(() => import("./features/admin/RestaurantRegister"));
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
  return (
    <ErrorBoundary key={location.pathname}>
      <MenuProvider>
        <StaffBoardProvider>
          <Suspense fallback={<Loading fullScreen={false} />}>
            <Outlet />
          </Suspense>
        </StaffBoardProvider>
      </MenuProvider>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <GuestAuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <RealtimeProvider>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Navigate to={getLoginPath()} replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/staff/login" element={<StaffLogin />} />
                <Route path="/staff/:slug/login" element={<StaffLogin />} />
                <Route path="/register" element={<RestaurantRegister />} />
                <Route path="/admin" element={<PrivateRoute allowedRoles={["admin", "owner"]} />}>
                  <Route element={<AdminDashboard />}>
                    <Route index element={<Overview />} />
                    <Route path="overview" element={<Overview />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="tables" element={<Tables />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="register" element={<Register />} />
                    <Route path="qrcodes" element={<QRCodeGenerator />} />
                    <Route path="dailysales" element={<DailySales />} />
                    <Route path="trendingdishes" element={<TrendingDishes />} />
                    <Route path="totalincome" element={<TotalIncome />} />
                    <Route path="totalorders" element={<TotalOrders />} />
                    <Route path="bestemployees" element={<BestEmployees />} />
                  </Route>
                </Route>
                <Route path="/bar" element={<PrivateRoute allowedRoles={["bar", "kitchen"]} />}>
                  <Route element={<BarLayout />}>
                    <Route index element={<BarPageTableView />} />
                    <Route path="table/:tableId" element={<BarPage />} />
                  </Route>
                </Route>
                <Route path="/r/:slug/t/:qrCode" element={<Customer />} />
              </Routes>
            </Suspense>
          </RealtimeProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </GuestAuthProvider>
  );
}

export default App;
