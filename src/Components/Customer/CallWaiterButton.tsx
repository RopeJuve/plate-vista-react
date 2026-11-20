import { BellRing } from "lucide-react";
import { useCallWaiter } from "../../features/guest-ordering/hooks/useCallWaiter";
import { cn } from "@/lib/utils";

/** Asks staff to come to the table; stays lit for everyone at it until a waiter answers. */
const CallWaiterButton = ({ sessionId }: { sessionId: string }) => {
  const { state, call } = useCallWaiter(sessionId);
  const waiting = state !== "idle";
  const label = waiting ? "Waiter is on the way" : "Call waiter";

  return (
    <button
      type="button"
      onClick={call}
      disabled={waiting}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-sm font-bold transition-colors",
        waiting ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink hover:bg-ink/[0.05]"
      )}
    >
      <BellRing className={cn("h-4 w-4", waiting && "motion-safe:animate-pulse")} aria-hidden="true" />
      <span>{waiting ? "On the way" : "Waiter"}</span>
    </button>
  );
};

export default CallWaiterButton;
