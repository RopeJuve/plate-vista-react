import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./Components/AdminComponents/AdminDashboard";
import { PrivateRoute, BarPage, Customer, BarPageTableView } from "./pages";
import Login from "./Components/AdminComponents/Auth/Login";
import { OrderProvider } from "./contexts/OrderContext";
import Register from "./Components/AdminComponents/Auth/Register";

function App() {
  return (
    <div>
      <OrderProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />

            {/* Register Route */}
            <Route path="/register" element={<Register />} />
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={<PrivateRoute allowedRoles={["admin"]} />}
            >
              <Route path="*" element={<AdminDashboard />} />
              {/* Add nested routes here if necessary */}
            </Route>

            {/* Bar Routes */}
            <Route
              path="/bar"
              element={<PrivateRoute allowedRoles={["bar", "kitchen"]} />}
            >
              <Route path="" element={<BarPageTableView />} />
              <Route path="table/:tableId" element={<BarPage />} />
              {/* Add nested routes here if necessary */}
            </Route>
            <Route path="/table/:tableId" element={<Customer />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </div>
  );
}

export default App;
