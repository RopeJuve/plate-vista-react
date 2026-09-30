import {
  createContext,
  useReducer,
  useContext,
  useEffect,
  useCallback,
  useState,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { AUTH_EVENTS } from "../utils/notify";
import { User } from "../types";
import { decodeJwt, readRestaurantId, readRestaurantIdFromUnknown, readRestaurantSlug } from "../shared/api/jwt";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  refreshSession,
  revokeSession,
  saveTokens,
  subscribeTokens,
  type TokenBody,
} from "../shared/api/tokens";

type AuthState = {
  user: User | null;
  restaurantId: string | null;
  restaurantSlug: string | null;
};

type AuthAction =
  | { type: "LOGIN"; payload: { user?: User | null; restaurantId?: string | null; restaurantSlug?: string | null } }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_RESTAURANT"; payload: string }
  | { type: "SET_RESTAURANT_SLUG"; payload: string }
  | { type: "LOGOUT" };

type AuthContextValue = {
  authToken: string | null;
  /** True while a reload trades the stored refresh token for an access token. */
  restoring: boolean;
  user: User | null;
  restaurantId: string | null;
  /** The restaurant's URL slug, as in `/r/<slug>/t/<qrCode>`. Null until a login or the user lookup has told us. */
  restaurantSlug: string | null;
  /**
   * Stores the tokens from a login/register response body. `headerToken` is the
   * `Authorization` response header, used only if the body has no access token.
   * Returns false when the response carried no access token.
   */
  login: (tokens: TokenBody, nextUser?: User, nextRestaurantId?: unknown, headerToken?: string | null) => boolean;
  logout: () => void;
  setUser: (nextUser: User) => void;
  setRestaurantId: (nextId: string) => void;
  setRestaurantSlug: (nextSlug: string) => void;
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
        user: action.payload.user ?? state.user,
        restaurantId: action.payload.restaurantId ?? state.restaurantId,
        restaurantSlug: action.payload.restaurantSlug ?? state.restaurantSlug,
      };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_RESTAURANT":
      return { ...state, restaurantId: action.payload };
    case "SET_RESTAURANT_SLUG":
      return { ...state, restaurantSlug: action.payload };
    case "LOGOUT":
      return { ...state, user: null, restaurantId: null, restaurantSlug: null };
    default:
      return state;
  }
};

const readInitialRestaurantId = () => {
  const stored = localStorage.getItem("restaurantId");
  if (stored) {
    return stored;
  }
  const token = getAccessToken();
  return token ? readRestaurantId(decodeJwt(token)) : null;
};

const readInitialRestaurantSlug = () => {
  const stored = localStorage.getItem("restaurantSlug");
  if (stored) {
    return stored;
  }
  const token = getAccessToken();
  return token ? readRestaurantSlug(decodeJwt(token)) : null;
};

const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const authToken = useSyncExternalStore(subscribeTokens, getAccessToken);
  const [restoring, setRestoring] = useState(() => !getAccessToken() && Boolean(getRefreshToken()));
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    restaurantId: readInitialRestaurantId(),
    restaurantSlug: readInitialRestaurantSlug(),
  });

  const { user, restaurantId, restaurantSlug } = state;

  useEffect(() => {
    localStorage.removeItem("user");
    if (restaurantId) {
      localStorage.setItem("restaurantId", restaurantId);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantSlug) {
      localStorage.setItem("restaurantSlug", restaurantSlug);
    }
  }, [restaurantSlug]);

  useEffect(() => {
    if (!restoring) {
      return;
    }
    refreshSession()
      .catch(() => undefined)
      .finally(() => setRestoring(false));
  }, [restoring]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearTokens();
      localStorage.removeItem("restaurantId");
      localStorage.removeItem("restaurantSlug");
      dispatch({ type: "LOGOUT" });
    };
    window.addEventListener(AUTH_EVENTS.LOGOUT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_EVENTS.LOGOUT, handleUnauthorized);
    };
  }, []);

  const login = useCallback(
    (tokens: TokenBody, nextUser?: User, nextRestaurantId?: unknown, headerToken?: string | null) => {
      const token = saveTokens(tokens, headerToken);
      if (!token) {
        return false;
      }
      const payload = decodeJwt(token);
      const restaurantId =
        readRestaurantIdFromUnknown(nextRestaurantId) ||
        readRestaurantId(payload) ||
        undefined;
      dispatch({
        type: "LOGIN",
        payload: { user: nextUser, restaurantId, restaurantSlug: readRestaurantSlug(payload) },
      });
      return true;
    },
    []
  );

  const setUser = useCallback((nextUser: User) => {
    dispatch({ type: "SET_USER", payload: nextUser });
  }, []);

  const setRestaurantId = useCallback((nextId: string) => {
    dispatch({ type: "SET_RESTAURANT", payload: nextId });
  }, []);

  const setRestaurantSlug = useCallback((nextSlug: string) => {
    dispatch({ type: "SET_RESTAURANT_SLUG", payload: nextSlug });
  }, []);

  const logout = useCallback(() => {
    void revokeSession();
    localStorage.removeItem("restaurantId");
    localStorage.removeItem("restaurantSlug");
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authToken,
        restoring,
        login,
        logout,
        user,
        setUser,
        restaurantId,
        setRestaurantId,
        restaurantSlug,
        setRestaurantSlug,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };
