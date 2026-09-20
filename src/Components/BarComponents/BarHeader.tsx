import { Link } from "react-router-dom";
import Logo from "../../data/mainlogoLight.svg";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocketContext } from "../../contexts/WebSocketContext";

const getUserLabel = (user) => {
  if (!user) {
    return "Staff";
  }
  if (typeof user === "string") {
    return user;
  }
  return user.position || user.employee || user.email || "Staff";
};

const BarHeader = () => {
  const { logout, user } = useAuth();
  const { resetWebSocket } = useWebSocketContext();
  return (
    <div className="max-w-4xl mx-auto  text-gray-100 bg-secondary-dark-bg flex justify-between items-center p-3 rounded-lg">
      <Link to="/bar" aria-label="Back to tables">
        <img src={Logo} style={{ width: "170px", height: "50px" }} alt="Plate Vista logo" />
      </Link>
      <h1 className="text-2xl font-semibold uppercase">{getUserLabel(user)}</h1>
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
