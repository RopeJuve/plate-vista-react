import { formatCents } from "../../shared/money/formatCents";
import { cn } from "@/lib/utils";

/** A total printed on a check: label, dotted leader, amount. `strong` is the line the guest pays. */
const TotalLine = ({
  label,
  cents,
  strong = false,
  className,
}: {
  label: string;
  cents: number;
  strong?: boolean;
  className?: string;
}) => (
  <div className={cn("flex items-baseline gap-2 font-mono", strong ? "text-lg" : "text-sm text-ink-soft", className)}>
    <span className={cn("uppercase tracking-[0.1em]", strong ? "text-sm font-bold text-ink" : "")}>{label}</span>
    <span className="leader" aria-hidden="true" />
    <span className="font-bold tabular">{formatCents(cents)}</span>
  </div>
);

export default TotalLine;
