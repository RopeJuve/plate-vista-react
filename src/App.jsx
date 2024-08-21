import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Costumer } from "./pages";
import AdminDashboard from "./components/AdminComponents/AdminDashboard";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Costumer />} />
          <Route path="/admin/*" element={
            <AdminDashboard />
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;