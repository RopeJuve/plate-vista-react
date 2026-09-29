import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import Loading from "./Loading";
import { User } from "../types";
import { decodeJwt, readRestaurantId, readRestaurantIdFromUnknown } from "../shared/api/jwt";

const isRoleAllowed = (user: User | null, allowedRoles: string[] = []) => {
  if (!user) {
    return false;
  }
  return Boolean(
    (user.position && allowedRoles.includes(user.position)) ||
      (user.role && allowedRoles.includes(user.role))
  );
};

const PrivateRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { authToken, restoring, logout, setUser, setRestaurantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const allowedKey = (allowedRoles || []).join(",");

  useEffect(() => {
    let cancelled = false;

    const verifyUser = async () => {
      if (restoring) {
        return;
      }
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
        const nextRestaurantId =
          readRestaurantIdFromUnknown(data) ||
          (authToken ? readRestaurantId(decodeJwt(authToken)) : null);
        if (nextRestaurantId) {
          setRestaurantId(nextRestaurantId);
        }
        const nextSlug =
          data?.restaurant?.slug ||
          data?.user?.restaurant?.slug ||
          data?.slug ||
          data?.user?.slug;
        if (typeof nextSlug === "string" && nextSlug) {
          localStorage.setItem("restaurantSlug", nextSlug);
        }
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
  }, [authToken, restoring, allowedKey, logout, setUser, setRestaurantId]);

  if (restoring) {
    return <Loading />;
  }

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
