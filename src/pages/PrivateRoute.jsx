import { useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import Loading from "./Loading";

const PrivateRoute = ({ allowedRoles }) => {
  const { authToken, logout, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const role = user;
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/auth/user");
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
      verifyUser();
      setLoading(false);
    }
  }, [authToken, role, logout, allowedRoles, navigate]);

  return loading ? <Loading /> : <Outlet context={{ userData }} />;
};

export default PrivateRoute;
