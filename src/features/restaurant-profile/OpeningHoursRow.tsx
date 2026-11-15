import { useId, useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMinuteClock } from "./hooks/useMinuteClock";
import { localClock, openStatus, weekRows } from "./openingHours";
import type { OpeningHours } from "./types";

/** Whether the restaurant is open right now, in its own timezone; tap for the whole week. */
const OpeningHoursRow = ({ hours, timezone }: { hours: OpeningHours; timezone: string }) => {
  const now = useMinuteClock();
  const [expanded, setExpanded] = useState(false);
  const weekId = useId();
  const status = openStatus(hours, timezone, now);
  if (!status) {
    return null;
  }

  return (
    <div className="px-4 py-3.5">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-controls={weekId}
        className="-m-1 flex w-[calc(100%+0.5rem)] items-start gap-3 rounded-md p-1 text-left hover:bg-paper-deep/60"
      >
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink">Opening hours</span>
          <span className="flex items-center gap-1.5 text-sm">
            <span
              className={cn("h-2 w-2 rounded-full", status.open ? "bg-pass" : "bg-ink/30")}
              aria-hidden="true"
            />
            <span className={cn("font-semibold", status.open ? "text-pass-ink" : "text-ink")}>{status.label}</span>
            <span className="font-mono tabular text-ink-soft">· {status.detail}</span>
          </span>
        </span>
        <ChevronDown
          className={cn("mt-1 h-4 w-4 shrink-0 text-ink-soft transition-transform", expanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <dl id={weekId} hidden={!expanded} className="mt-3 space-y-1 pl-8 text-sm">
        {weekRows(hours, localClock(now, timezone).day).map((row) => (
          <div key={row.day} className={cn("flex justify-between gap-4", row.today ? "font-bold text-ink" : "text-ink-soft")}>
            <dt>{row.label}</dt>
            <dd className="text-right font-mono tabular">
              {row.times.map((time) => (
                <span key={time} className="block">
                  {time}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default OpeningHoursRow;
