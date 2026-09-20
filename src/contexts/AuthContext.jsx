import { createContext, useReducer, useContext, useEffect, useCallback } from "react";
import { AUTH_EVENTS } from "../utils/notify";

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

const authReducer = (state, action) => {
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

const AuthProvider = ({ children }) => {
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

  const login = useCallback((token, nextUser, nextRestaurantId) => {
    dispatch({
      type: "LOGIN",
      payload: { token, user: nextUser, restaurantId: nextRestaurantId },
    });
  }, []);

  const setUser = useCallback((nextUser) => {
    dispatch({ type: "SET_USER", payload: nextUser });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AuthContext.Provider
      value={{ authToken, login, logout, user, setUser, restaurantId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };
