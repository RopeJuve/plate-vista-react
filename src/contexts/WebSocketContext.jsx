import { createContext, useContext, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [tableNum, setTableNum] = useState('');
  const [userId, setUserId] = useState('');

  const { sendMessage, lastMessage, readyState} = useWebSocket(
    `${import.meta.env.VITE_WS_API_URL}`,
    {
      queryParams: { tableNum, userId },
      sheared: true,
      onOpen: () => console.log("Connected to WebSocket"),
      onClose: () => console.log("WebSocket connection closed"),
      onError: (event) => console.error("WebSocket error:", event),
      onMessage: (event) => {
        const messageData = JSON.parse(event.data);
        console.log(messageData)
        setMessages((prev) => [...prev, messageData]);
      },
      shouldReconnect: (closeEvent) => true,
    }
  );

  return (
    <WebSocketContext.Provider
      value={{ sendMessage, messages, readyState, lastMessage,tableNum, setTableNum, setUserId }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => useContext(WebSocketContext);
