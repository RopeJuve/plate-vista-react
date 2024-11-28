import { createContext, useReducer, useContext, useEffect } from "react";

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        authToken: action.payload.token,
        user: action.payload.user,
        restaurantId: action.payload.restaurantId,
      };
    case "LOGOUT":
      return { ...state, authToken: null, user: null, restaurantId: null };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    authToken: localStorage.getItem("authToken")
      ? localStorage.getItem("authToken")
      : null,
    user: localStorage.getItem("user") ? localStorage.getItem("user") : null,
    restaurantId: localStorage.getItem("restaurantId")
      ? localStorage.getItem("restaurantId")
      : null,
  });

  const { authToken, user, restaurantId } = state;

  useEffect(() => {
    if (authToken && user) {
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("user", user);
      localStorage.setItem("restaurantId", restaurantId);
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("restaurantId");
    }
  }, [authToken, restaurantId]);

  const login = (token, user, restaurantId) => {
    dispatch({ type: "LOGIN", payload: { token, user, restaurantId } });
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{ authToken, login, logout, user, restaurantId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };
