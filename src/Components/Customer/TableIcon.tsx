import { Utensils } from "lucide-react";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import type { RealtimeStatus } from "../../shared/realtime/protocol";

const dotClass = (status: RealtimeStatus) => {
  if (status === "open") {
    return "bg-green-400";
  }
  if (status === "connecting" || status === "reconnecting") {
    return "bg-yellow-400";
  }
  return "bg-red-400";
};

const TableIcon = ({ tableNum }: { tableNum?: number }) => {
  const { status } = useRealtime();
  const label = status === "open" ? "Online" : "Connecting";

  return (
    <div className="inline-flex items-center gap-1">
      <Utensils className="h-6 w-6" />
      <span className="text-sm">{tableNum || ""}</span>
      <span className={`h-2 w-2 animate-pulse rounded-full ${dotClass(status)}`} title={label} />
    </div>
  );
};

export default TableIcon;
