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
      };
    case "LOGOUT":
      return { ...state, authToken: null, user: null };
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
  });

  const { authToken, user } = state;

  useEffect(() => {
    if (authToken && user) {
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("user", user);
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
  }, [authToken]);

  const login = (token, user) => {
    dispatch({ type: "LOGIN", payload: { token, user } });
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };
