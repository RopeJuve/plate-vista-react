import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import Loading from "./Loading";
import { User } from "../types";

const isRoleAllowed = (user, allowedRoles: string[] = []) => {
  if (!user) {
    return false;
  }
  return allowedRoles.includes(user.position) || allowedRoles.includes(user.role);
};

const PrivateRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { authToken, logout, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const allowedKey = (allowedRoles || []).join(",");

  useEffect(() => {
    let cancelled = false;

    const verifyUser = async () => {
      if (!authToken) {
        setLoading(false);
        setAllowed(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get("/auth/user");
        if (cancelled) {
          return;
        }
        const nextUser = (data?.user ?? data) as User;
        setUserData(data);
        setUser(nextUser);
        setAllowed(isRoleAllowed(nextUser, allowedKey.split(",").filter(Boolean)));
      } catch {
        if (!cancelled) {
          setAllowed(false);
          logout();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    verifyUser();
    return () => {
      cancelled = true;
    };
  }, [authToken, allowedKey, logout, setUser]);

  if (!authToken) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <Loading />;
  }

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet context={{ userData }} />;
};

export default PrivateRoute;
