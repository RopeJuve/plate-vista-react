import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/AdminComponents/AdminDashboard";
import { Costumer, PrivateRoute, BarPage } from "./pages";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Costumer />} />
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