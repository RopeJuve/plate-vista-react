import { useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRealtime } from "../../realtime/RealtimeProvider";

/** Signing out of any staff screen: drop the live connection first, then the session. */
export const useSignOut = () => {
  const { logout } = useAuth();
  const { disconnect } = useRealtime();

  return useCallback(() => {
    disconnect();
    logout();
  }, [disconnect, logout]);
};
