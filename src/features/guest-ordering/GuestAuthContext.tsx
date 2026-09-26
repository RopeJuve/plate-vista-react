import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { GuestSession } from "./types";

type GuestAuthValue = {
  session: GuestSession | null;
  setSession: (session: GuestSession) => void;
  clearSession: () => void;
};

const GuestAuthContext = createContext<GuestAuthValue | undefined>(undefined);

export const GuestAuthProvider = ({ children }: { children?: ReactNode }) => {
  const [session, setSessionState] = useState<GuestSession | null>(null);

  const setSession = useCallback((next: GuestSession) => {
    setSessionState(next);
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
  }, []);

  const value = useMemo(
    () => ({ session, setSession, clearSession }),
    [session, setSession, clearSession]
  );

  return <GuestAuthContext.Provider value={value}>{children}</GuestAuthContext.Provider>;
};

export const useGuestAuth = () => {
  const context = useContext(GuestAuthContext);
  if (!context) {
    throw new Error("useGuestAuth must be used within GuestAuthProvider");
  }
  return context;
};
