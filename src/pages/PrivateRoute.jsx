import { useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchUserData } from "../services/fetchData";

const PrivateRoute = ({ allowedRoles }) => {
  const { authToken, logout, user } = useAuth();
  const [userData, setUserData] = useState(null);
  const role = user;
  const navigate = useNavigate();

  useEffect(() => {
    if (!authToken && !allowedRoles.includes(role)) {
      navigate("/");
      return;
    }
    const fetchData = async () => {
      const { data } = await fetchUserData(
        `${import.meta.env.VITE_VERCEL_API_URL}/auth/user`,
        authToken,
        logout
      );
      console.log(data.user);
      setUserData(data);
    };
    fetchData();
  }, [authToken, role, logout, allowedRoles, navigate]);

  return <Outlet context={{ userData }} />;
};

export default PrivateRoute;
