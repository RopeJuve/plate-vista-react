import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Quantity stepper sized for thumbs: 40px targets on paper and on steel. */
const QtyStepper = ({
  value,
  onDecrease,
  onIncrease,
  label,
  min = 1,
  max = 99,
  className,
  tone = "paper",
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  label: string;
  min?: number;
  max?: number;
  className?: string;
  tone?: "paper" | "steel";
}) => {
  const button = cn(
    "grid h-10 w-10 place-items-center rounded-md transition-colors disabled:opacity-35",
    tone === "paper" ? "bg-ink/[0.06] text-ink hover:bg-ink/[0.12]" : "bg-white/10 text-paper hover:bg-white/20"
  );
  return (
    <div className={cn("inline-flex items-center gap-1", className)} role="group" aria-label={`Quantity of ${label}`}>
      <button
        type="button"
        className={button}
        onClick={onDecrease}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        <Minus className="h-4 w-4" strokeWidth={2.5} />
      </button>
      <span className="w-7 text-center font-mono text-base font-bold tabular" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={button}
        onClick={onIncrease}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default QtyStepper;
