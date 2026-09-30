import type { RealtimeStatus } from "../../shared/realtime/protocol";
import { cn } from "@/lib/utils";

const LABEL: Record<RealtimeStatus, string> = {
  open: "Live",
  connecting: "Connecting",
  reconnecting: "Reconnecting",
  closed: "Offline",
};

/** The connection lamp: green and steady when live, amber and pulsing otherwise. */
const Lamp = ({
  status,
  className,
  showLabel = true,
}: {
  status: RealtimeStatus;
  className?: string;
  showLabel?: boolean;
}) => {
  const live = status === "open";
  const dead = status === "closed";
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]", className)}
      role="status"
      aria-live="polite"
    >
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          live && "bg-pass shadow-[0_0_0_3px_hsl(var(--pass)/0.22)]",
          !live && !dead && "animate-lamp bg-amber shadow-[0_0_0_3px_hsl(var(--amber)/0.22)]",
          dead && "bg-alert shadow-[0_0_0_3px_hsl(var(--alert)/0.22)]"
        )}
        aria-hidden="true"
      />
      <span className={showLabel ? "" : "sr-only"}>{LABEL[status]}</span>
    </span>
  );
};

export default Lamp;
