import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import { apiMessage, consumeSessionMessage } from "../../../utils/notify";
import { readTokenFromHeaders, readRestaurantIdFromUnknown } from "../../api/jwt";
import type { TokenBody } from "../../api/tokens";
import { rememberLoginKind, type LoginKind } from "../loginPaths";

const FAILED = "Login failed. Please try again.";

// Posts the credentials, stores the session, and opens the app for the role:
// owners and admins get the dashboard, bar and kitchen get the board.
export const useSignIn = (kind: LoginKind) => {
  const navigate = useNavigate();
  const { login, logout, setRestaurantSlug } = useAuth();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(() => consumeSessionMessage() || "");

  const signIn = async (endpoint: string, body: Record<string, string>, displayName: string) => {
    setPending(true);
    setMessage("");
    try {
      const response = await api.post(endpoint, body, { skipErrorToast: true });
      const data = response.data as TokenBody & {
        position?: string;
        restaurantId?: unknown;
        restaurant?: { slug?: string };
      };
      const position = data.position;
      const loggedIn = login(
        data,
        { position, employee: displayName },
        readRestaurantIdFromUnknown(data) ?? undefined,
        readTokenFromHeaders(response.headers)
      );
      if (!loggedIn) {
        setMessage(FAILED);
        return false;
      }
      rememberLoginKind(kind);
      if (data.restaurant?.slug) {
        setRestaurantSlug(data.restaurant.slug);
      }

      if (position === "admin" || position === "owner") {
        navigate("/admin");
        return true;
      }
      if (position === "bar" || position === "kitchen") {
        navigate("/bar");
        return true;
      }
      logout();
      setMessage("This account does not have access to the staff apps.");
      return false;
    } catch (error: unknown) {
      setMessage(apiMessage(error, FAILED));
      return false;
    } finally {
      setPending(false);
    }
  };

  return { signIn, pending, message };
};
