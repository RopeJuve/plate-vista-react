import React from "react";
import Logo from "../../data/mainlogoLight.svg";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocketContext } from "../../contexts/WebSocketContext";

const BarHeader = () => {
  const { logout, user } = useAuth();
  const { resetWebSocket } = useWebSocketContext();
  return (
    <div className="max-w-4xl mx-auto  text-gray-100 bg-secondary-dark-bg flex justify-between items-center p-3 rounded-lg">
      <img src={Logo} style={{ width: "170px", height: "50px" }} alt="Plate Vista logo" />
      <h1 className="text-2xl font-semibold uppercase">{user?.position || user?.employee || user}</h1>
      <button
        type="button"
        onClick={() => {
          resetWebSocket();
          logout();
        }}
        className="text-red-500 cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default BarHeader;
