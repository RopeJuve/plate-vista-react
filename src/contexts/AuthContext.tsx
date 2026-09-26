import { createContext, useReducer, useContext, useEffect, useCallback, ReactNode } from "react";
import { AUTH_EVENTS } from "../utils/notify";
import { User } from "../types";
import { decodeJwt } from "../shared/api/jwt";

type AuthState = {
  authToken: string | null;
  user: User | null;
  restaurantId: string | null;
};

type AuthAction =
  | { type: "LOGIN"; payload: { token: string; user?: User | null; restaurantId?: string | null } }
  | { type: "SET_USER"; payload: User }
  | { type: "LOGOUT" };

type AuthContextValue = {
  authToken: string | null;
  user: User | null;
  restaurantId: string | null;
  login: (token: string, nextUser?: User, nextRestaurantId?: string) => void;
  logout: () => void;
  setUser: (nextUser: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        authToken: action.payload.token,
        user: action.payload.user ?? state.user,
        restaurantId: action.payload.restaurantId ?? state.restaurantId,
      };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, authToken: null, user: null, restaurantId: null };
    default:
      return state;
  }
};

const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    authToken: localStorage.getItem("authToken") || null,
    user: null,
    restaurantId: localStorage.getItem("restaurantId") || null,
  });

  const { authToken, user, restaurantId } = state;

  useEffect(() => {
    localStorage.removeItem("user");
    if (authToken) {
      localStorage.setItem("authToken", authToken);
      if (restaurantId) {
        localStorage.setItem("restaurantId", restaurantId);
      }
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("restaurantId");
    }
  }, [authToken, restaurantId]);

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch({ type: "LOGOUT" });
    };
    window.addEventListener(AUTH_EVENTS.LOGOUT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_EVENTS.LOGOUT, handleUnauthorized);
    };
  }, []);

  const login = useCallback((token: string, nextUser?: User, nextRestaurantId?: string) => {
    const payload = decodeJwt(token);
    const slug = payload.slug || payload.restaurantSlug;
    if (typeof slug === "string" && slug) {
      localStorage.setItem("restaurantSlug", slug);
    }
    dispatch({
      type: "LOGIN",
      payload: { token, user: nextUser, restaurantId: nextRestaurantId },
    });
  }, []);

  const setUser = useCallback((nextUser: User) => {
    dispatch({ type: "SET_USER", payload: nextUser });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AuthContext.Provider value={{ authToken, login, logout, user, setUser, restaurantId }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };
