import { useState } from "react";
import BarOrders from "./BarOrders";
import { useAuth } from "../../contexts/AuthContext";
import type { Station } from "../../shared/realtime/protocol";

const OrdersList = () => {
  const { user } = useAuth();
  const defaultStation: Station | "all" =
    user?.position === "kitchen" || user?.position === "bar" ? user.position : "all";
  const [station, setStation] = useState<Station | "all">(defaultStation);

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(["all", "kitchen", "bar"] as const).map((option) => (
          <button
            key={option}
            type="button"
            className={
              station === option
                ? "rounded-lg bg-orange-500 px-3 py-2 text-sm text-white"
                : "rounded-lg bg-gray-700 px-3 py-2 text-sm"
            }
            onClick={() => setStation(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 md:h-screen">
        <BarOrders title="New orders" statuses={["pending"]} station={station} />
        <BarOrders title="In progress" statuses={["accepted", "preparing", "ready"]} station={station} />
        <BarOrders title="Served" statuses={["served"]} station={station} />
      </div>
    </div>
  );
};

export default OrdersList;
