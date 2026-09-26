import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { plateVistaConfig } from "../../Config/plateVista.config";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { fetchWsTicket } from "../../shared/api/wsTicket";
import { RealtimeClient } from "./client";
import {
  ProtocolError,
  type ClientMessageType,
  type ClientPayloadOf,
  type CloseAction,
  type RealtimeStatus,
  type EventData,
  type ServerEventName,
} from "./protocol";
import { useGuestAuth } from "../../features/guest-ordering/GuestAuthContext";
import { parseGuestAuth } from "../../features/guest-ordering/guestSession";

type RealtimeContextValue = {
  status: RealtimeStatus;
  sessionEnded: boolean;
  closeAction: CloseAction | null;
  fatalMessage: string;
  request: <T extends ClientMessageType, D = unknown>(
    type: T,
    payload: ClientPayloadOf<T>,
    requestId?: string
  ) => Promise<D>;
  subscribe: <K extends ServerEventName>(event: K, handler: (data: EventData<K>) => void) => () => void;
  disconnect: () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

const isGuestPath = (pathname: string) => /^\/r\/[^/]+\/t\/[^/]+/.test(pathname);

export const RealtimeProvider = ({ children }: { children?: ReactNode }) => {
  const location = useLocation();
  const { authToken, login, logout } = useAuth();
  const { session, setSession, clearSession } = useGuestAuth();
  const [status, setStatus] = useState<RealtimeStatus>("closed");
  const [sessionEnded, setSessionEnded] = useState(false);
  const [closeAction, setCloseAction] = useState<CloseAction | null>(null);
  const [fatalMessage, setFatalMessage] = useState("");

  const tokenRef = useRef<string | null>(null);
  const guestRef = useRef(session);
  const staffTokenRef = useRef(authToken);
  const guestPathRef = useRef(false);
  guestRef.current = session;
  staffTokenRef.current = authToken;
  guestPathRef.current = isGuestPath(location.pathname);

  const accessToken = guestPathRef.current ? session?.token ?? null : authToken;
  tokenRef.current = accessToken;

  const clientRef = useRef<RealtimeClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = new RealtimeClient({
      wsBaseUrl: plateVistaConfig.VITE_WS_API_URL || "",
      getTicket: async () => {
        const token = tokenRef.current;
        if (!token) {
          throw new Error("Missing access token");
        }
        return fetchWsTicket(token);
      },
      onStatusChange: setStatus,
      onClose: (_code, _reason, action) => {
        setCloseAction(action);
        if (action === "guestThankYou") {
          setSessionEnded(true);
          return;
        }
        if (action === "logout") {
          if (guestPathRef.current) {
            clearSession();
            setFatalMessage("This table session is no longer valid.");
            return;
          }
          logout();
          return;
        }
        if (action === "reload") {
          setFatalMessage("Please reload the app.");
          return;
        }
        if (action === "refreshToken") {
          void (async () => {
            try {
              if (guestPathRef.current && guestRef.current) {
                const current = guestRef.current;
                const { data } = await api.post(`/auth/table/${encodeURIComponent(current.qrCode)}`);
                const next = parseGuestAuth(data, current.slug, current.qrCode);
                tokenRef.current = next.token;
                setSession(next);
                clientRef.current?.connect();
                return;
              }
              const response = await api.post("/auth/refresh");
              const refreshed =
                response.data?.token ||
                response.data?.accessToken ||
                response.headers?.authorization;
              if (typeof refreshed === "string" && refreshed) {
                const token = refreshed.startsWith("Bearer ") ? refreshed.slice(7) : refreshed;
                tokenRef.current = token;
                login(token);
                clientRef.current?.connect();
                return;
              }
            } catch {
              // Refresh is unavailable. Staff must sign in again.
            }
            if (guestPathRef.current) {
              setFatalMessage("This table session expired. Scan the QR code again.");
              return;
            }
            logout();
          })();
        }
      },
    });
  }

  const enabled = guestPathRef.current
    ? Boolean(session?.token) && !sessionEnded
    : location.pathname.startsWith("/bar") && Boolean(authToken);

  useEffect(() => {
    const client = clientRef.current;
    if (!client) {
      return;
    }
    if (!enabled || !tokenRef.current) {
      client.disconnect();
      return;
    }
    client.connect();
  }, [enabled, accessToken, sessionEnded]);

  useEffect(() => {
    if (!guestPathRef.current) {
      setSessionEnded(false);
    }
  }, [location.pathname]);

  const request = useMemo(() => {
    return <T extends ClientMessageType, D = unknown>(
      type: T,
      payload: ClientPayloadOf<T>,
      requestId?: string
    ) => {
      const client = clientRef.current;
      if (!client) {
        return Promise.reject(new ProtocolError("INTERNAL", "Not connected"));
      }
      return client.request<T, D>(type, payload, requestId);
    };
  }, []);

  const subscribe = useMemo(() => {
    return <K extends ServerEventName>(event: K, handler: (data: EventData<K>) => void) => {
      const client = clientRef.current;
      if (!client) {
        return () => undefined;
      }
      return client.subscribe(event, handler);
    };
  }, []);

  const disconnect = useMemo(() => {
    return () => clientRef.current?.disconnect();
  }, []);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      status,
      sessionEnded,
      closeAction,
      fatalMessage,
      request,
      subscribe,
      disconnect,
    }),
    [status, sessionEnded, closeAction, fatalMessage, request, subscribe, disconnect]
  );

  const connecting = status === "connecting" || status === "reconnecting";

  return (
    <RealtimeContext.Provider value={value}>
      {fatalMessage && (
        <div className="fixed top-0 left-0 right-0 z-[1500] bg-amber-500 px-4 py-2 text-center text-sm text-black" role="alert">
          {fatalMessage}
        </div>
      )}
      {connecting && !fatalMessage && (
        <div className="fixed top-0 left-0 right-0 z-[1500] bg-amber-100 px-4 py-2 text-center text-sm text-amber-950" role="status">
          Connecting…
        </div>
      )}
      {status === "closed" && enabled && !sessionEnded && !fatalMessage && (
        <div className="fixed top-0 left-0 right-0 z-[1500] bg-amber-100 px-4 py-2 text-center text-sm text-amber-950" role="status">
          Connecting…
        </div>
      )}
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return context;
};
