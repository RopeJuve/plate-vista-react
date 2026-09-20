import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import PrivateRoute from "./pages/PrivateRoute";
import { OrderProvider } from "./contexts/OrderContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import ErrorBoundary from "./Components/ErrorBoundary";
import Loading from "./pages/Loading";

const Login = lazy(() => import("./Components/AdminComponents/Auth/Login"));
const AdminDashboard = lazy(() => import("./Components/AdminComponents/AdminDashboard"));
const BarPage = lazy(() => import("./pages/BarPage"));
const BarPageTableView = lazy(() => import("./pages/BarPageTableView"));
const Customer = lazy(() => import("./pages/Customer"));

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
                  <Route path="/:restaurantId" element={<Login />} />
                  <Route path="/register" element={<Navigate to="/" replace />} />
                  <Route
                    path="/admin/*"
                    element={<PrivateRoute allowedRoles={["admin"]} />}
                  >
                    <Route path="*" element={<AdminDashboard />} />
                  </Route>
                  <Route
                    path="/bar"
                    element={<PrivateRoute allowedRoles={["bar", "kitchen"]} />}
                  >
                    <Route path="" element={<BarPageTableView />} />
                    <Route path="table/:tableId" element={<BarPage />} />
                  </Route>
                  <Route path="/table/:tableId" element={<Customer />} />
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
