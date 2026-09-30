import { formatCents } from "../../shared/money/formatCents";
import { cn } from "@/lib/utils";

const TotalLine = ({ label, cents, strong = false }: { label: string; cents: number; strong?: boolean }) => (
  <div className={cn("flex items-baseline gap-2 font-mono", strong ? "text-lg" : "text-sm text-ink-soft")}>
    <span className={cn("uppercase tracking-[0.1em]", strong ? "text-sm font-bold text-ink" : "")}>{label}</span>
    <span className="leader" aria-hidden="true" />
    <span className="font-bold tabular">{formatCents(cents)}</span>
  </div>
);

export default TotalLine;
