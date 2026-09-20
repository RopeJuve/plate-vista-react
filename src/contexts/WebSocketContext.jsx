import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { plateVistaConfig } from "../Config/plateVista.config";
import { useAuth } from "./AuthContext";
import api from "../services/api";
import { notify, triggerUnauthorized } from "../utils/notify";

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
  const [latestByType, setLatestByType] = useState({});
  const [tableError, setTableError] = useState(null);
  const [tables, setTables] = useState([]);
  const employeeReconnectFailures = useRef(0);
  const pendingDeleteIds = useRef(new Set());

  const queueDeletedOrder = useCallback((orderId) => {
    if (orderId) {
      pendingDeleteIds.current.add(orderId);
    }
  }, []);

  const applyPendingDeletes = useCallback((tableList = []) => {
    if (pendingDeleteIds.current.size === 0) {
      return tableList;
    }
    return tableList.map((table) => ({
      ...table,
      orders: (table.orders || []).filter(
        (order) => !pendingDeleteIds.current.has(order._id)
      ),
    }));
  }, []);

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

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
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
          if (messageData.type === "error") {
            const errorText =
              typeof messageData.payload === "string"
                ? messageData.payload
                : "Something went wrong";
            notify(errorText);
            return;
          }

          if (messageData.type === "allTables") {
            const nextTables = applyPendingDeletes(messageData.payload || []);
            pendingDeleteIds.current.clear();
            setTables(nextTables);
            setLatestByType((prev) => ({
              ...prev,
              allTables: { ...messageData, payload: nextTables },
            }));
            return;
          }

          if (messageData.type === "orderSuccess" && !messageData.payload) {
            setTables((prev) => {
              const nextTables = applyPendingDeletes(prev);
              pendingDeleteIds.current.clear();
              return nextTables;
            });
            return;
          }

          setLatestByType((prev) => ({
            ...prev,
            [messageData.type]: messageData,
          }));
        } catch (error) {
          console.error("WebSocket message parse error:", error);
        }
      },
    },
    shouldConnect
  );

  const resetWebSocket = useCallback(() => {
    try {
      getWebSocket()?.close();
    } catch {
      // Socket may already be closed.
    }
    setLatestByType({});
    setTables([]);
    setTableError(null);
    pendingDeleteIds.current.clear();
    localStorage.removeItem("cart");
  }, [getWebSocket]);

  const isOffline =
    shouldConnect &&
    readyState !== 0 &&
    readyState !== 1;

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        messages: latestByType,
        readyState,
        lastMessage,
        tableNum,
        tableError,
        tables,
        queueDeletedOrder,
        resetWebSocket,
      }}
    >
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[1500] bg-red-600 px-4 py-2 text-center text-sm text-white" role="status">
          Offline — reconnecting to live orders
        </div>
      )}
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => useContext(WebSocketContext);
