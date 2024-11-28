import { useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchUserData } from "../services/fetchData";
import Loading from "./Loading";
import { plateVistaConfig } from "../Config/plateVista.config";


const PrivateRoute = ({ allowedRoles }) => {
  const { authToken, logout, user, restaurantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const role = user;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await fetchUserData(
          `${plateVistaConfig.VITE_VERCEL_API_URL}/auth/user`,
          authToken,
          logout,
          restaurantId
        );
        console.log(data.user);
        setUserData(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    if (authToken === null) {
      navigate("/", { replace: true });
    } else {
      fetchData();
      setLoading(false);
    }
  }, [authToken, role, logout, allowedRoles, navigate]);

  return loading ? <Loading /> : <Outlet context={{ userData }} />;
};

export default PrivateRoute;
