import type { RealtimeStatus } from "../../shared/realtime/protocol";

const Online = ({ status }: { status: RealtimeStatus }) => {
  const connecting = status === "connecting" || status === "reconnecting" || status === "closed";
  const online = status === "open";

  return (
    <div className="flex items-center justify-center gap-1 rounded-lg bg-gray-500 p-1">
      <span
        className={`h-2 w-2 animate-pulse rounded-full ${online ? "bg-green-400" : "bg-yellow-400"}`}
      />
      <h1 className="text-sm font-semibold">{online ? "Online" : connecting ? "Connecting…" : "Connecting…"}</h1>
    </div>
  );
};

export default Online;
