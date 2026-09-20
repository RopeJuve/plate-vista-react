import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { plateVistaConfig } from "../Config/plateVista.config";
import { useAuth } from "./AuthContext";
import api from "../services/api";
import { triggerUnauthorized } from "../utils/notify";

const WebSocketContext = createContext();

const buildSocketUrl = (token, tableNum) => {
  const base = plateVistaConfig.VITE_WS_API_URL;
  const params = new URLSearchParams({ token });
  if (tableNum) {
    params.set("tableNum", String(tableNum));
  }
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${params.toString()}`;
};

export const WebSocketProvider = ({ children }) => {
  const { authToken } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [tableError, setTableError] = useState(null);
  const employeeReconnectFailures = useRef(0);

  const tableNum = useMemo(() => {
    const barTableMatch = location.pathname.match(/^\/bar\/table\/([^/]+)/);
    if (barTableMatch) {
      return barTableMatch[1];
    }
    const guestTableMatch = location.pathname.match(/^\/table\/([^/]+)/);
    if (guestTableMatch) {
      return guestTableMatch[1];
    }
    return "";
  }, [location.pathname]);

  const getSocketUrl = useCallback(async () => {
    if (authToken) {
      setTableError(null);
      return buildSocketUrl(authToken, tableNum || undefined);
    }

    if (tableNum) {
      try {
        const { data } = await api.post(`/auth/table/${tableNum}`);
        setTableError(null);
        return buildSocketUrl(data.token);
      } catch (error) {
        const status = error.response?.status;
        if (status === 400 || status === 404) {
          setTableError("Invalid table, please scan the QR code again");
        }
        return null;
      }
    }

    return null;
  }, [authToken, tableNum]);

  const shouldConnect = Boolean(authToken || tableNum);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    getSocketUrl,
    {
      share: true,
      shouldReconnect: () => shouldConnect,
      reconnectAttempts: 5,
      reconnectInterval: (attemptNumber) =>
        Math.min(1000 * 2 ** attemptNumber, 10000),
      onOpen: () => {
        employeeReconnectFailures.current = 0;
      },
      onClose: (event) => {
        if (authToken && event.code === 1006) {
          employeeReconnectFailures.current += 1;
        }
      },
      onReconnectStop: () => {
        if (authToken) {
          triggerUnauthorized();
        }
      },
      onMessage: (event) => {
        try {
          const messageData = JSON.parse(event.data);
          setMessages((prev) => [...prev, messageData]);
        } catch (error) {
          console.error("WebSocket message parse error:", error);
        }
      },
    },
    shouldConnect
  );

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        messages,
        readyState,
        lastMessage,
        tableNum,
        tableError,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => useContext(WebSocketContext);
