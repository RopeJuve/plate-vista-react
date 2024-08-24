import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/AdminComponents/AdminDashboard";
import { PrivateRoute, BarPage } from "./pages";
import Login from "./components/AdminComponents/Auth/Login";
import Register from "./components/AdminComponents/Auth/Register";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/*" element={
            <PrivateRoute allowedRoles={["admin"]} component={AdminDashboard} />
          } />
          <Route path="/bar" element={<BarPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;