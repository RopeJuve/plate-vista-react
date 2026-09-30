import type { OrderStatus } from "../../shared/realtime/protocol";
import { ORDER_STATUS_LABEL } from "../../shared/realtime/protocol";
import { cn } from "@/lib/utils";

const STEPS: OrderStatus[] = ["pending", "accepted", "preparing", "ready", "served"];

/**
 * The order lifecycle as one unbroken row of five cells, lit up to "now".
 * The same row sits on the guest's bill, the kitchen chit and the admin table.
 */
const StepRow = ({
  status,
  className,
  showLabel = true,
  tone = "paper",
}: {
  status: OrderStatus;
  className?: string;
  showLabel?: boolean;
  tone?: "paper" | "steel";
}) => {
  const cancelled = status === "cancelled";
  const reached = cancelled ? -1 : STEPS.indexOf(status);
  const label = ORDER_STATUS_LABEL[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex flex-1 gap-[3px]"
        role="img"
        aria-label={cancelled ? "Order cancelled" : `Step ${reached + 1} of 5: ${label}`}
      >
        {STEPS.map((step, index) => {
          const lit = index <= reached;
          const current = index === reached;
          return (
            <span
              key={step}
              className={cn(
                "h-1.5 flex-1 first:rounded-l-full last:rounded-r-full transition-colors duration-500",
                tone === "paper" ? "bg-ink/10" : "bg-white/10",
                lit && (status === "ready" || status === "served" ? "bg-pass" : "bg-ink"),
                lit && tone === "steel" && status !== "ready" && status !== "served" && "bg-paper",
                current && status === "pending" && "bg-signal",
                cancelled && "bg-transparent border-t border-dashed border-alert/60"
              )}
            />
          );
        })}
      </div>
      {showLabel && (
        <span
          className={cn(
            "min-w-[4.5rem] text-right text-[0.7rem] font-bold uppercase tracking-[0.08em]",
            status === "pending" && "text-signal-ink",
            (status === "ready" || status === "served") && (tone === "paper" ? "text-pass-ink" : "text-pass"),
            cancelled && "text-alert-ink line-through",
            tone === "steel" && status !== "pending" && status !== "ready" && status !== "served" && !cancelled && "text-steel-300"
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default StepRow;
