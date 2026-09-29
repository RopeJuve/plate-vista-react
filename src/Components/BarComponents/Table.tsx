import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { formatCents } from "../../shared/money/formatCents";
import { formatElapsed, minutesSince, useNow } from "../rail";
import { cn } from "@/lib/utils";

export type TableSummary = {
  open: number;
  ready: number;
  totalCents: number;
  oldestOpenAt: string;
};

const OldestTimer = ({ since }: { since: string }) => {
  const now = useNow();
  const late = minutesSince(since, now) >= 15;
  return (
    <span className={cn("font-mono text-sm font-bold tabular", late ? "text-alert-ink" : "text-ink")}>
      {formatElapsed(since, now)}
    </span>
  );
};

/**
 * A table on the floor. Free tables are an outline on the steel; a seated
 * table has an open check, so it turns into paper.
 */
const Table = memo(
  ({
    tableId,
    tableNumber,
    status,
    capacity,
    joinCode,
    summary,
  }: {
    tableId: string;
    tableNumber: number;
    status?: string;
    capacity?: number;
    /** Code late guests need to join; waiters read it out. */
    joinCode?: string;
    summary?: TableSummary;
  }) => {
    const navigate = useNavigate();
    const seated = status === "occupied";
    const reserved = status === "reserved";

    return (
      <button
        type="button"
        onClick={() => navigate(`/bar/table/${tableId}`)}
        aria-label={`Open table ${tableNumber}`}
        title={seated && joinCode ? `Join code ${joinCode}` : undefined}
        className={cn(
          "group relative flex h-36 w-full flex-col justify-between rounded-xl p-3.5 text-left transition-[transform,background-color,box-shadow] duration-200 ease-out-expo hover:-translate-y-0.5 active:translate-y-0",
          seated && "bg-paper text-ink shadow-[0_8px_20px_-8px_rgb(0_0_0/0.6)]",
          reserved && "border-2 border-dashed border-amber/70 bg-amber/[0.06] text-paper",
          !seated && !reserved && "border border-dashed border-steel-700 bg-steel-850/40 text-steel-300 hover:border-steel-500 hover:text-paper"
        )}
      >
        <span className="flex items-start justify-between">
          <span
            className={cn("text-[2.5rem] font-black leading-[0.85] tracking-[-0.04em]", seated ? "text-ink" : "text-inherit")}
            style={{ fontVariationSettings: '"wdth" 80' }}
          >
            {tableNumber}
          </span>
          <span className="flex flex-col items-end gap-1">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em]",
              seated && summary?.ready ? "bg-pass text-ink" : "",
              seated && !summary?.ready ? "bg-ink text-paper" : "",
              reserved && "bg-amber text-ink",
              !seated && !reserved && "text-inherit"
            )}
          >
            {seated ? (summary?.ready ? `${summary.ready} ready` : "Seated") : reserved ? "Reserved" : "Free"}
          </span>
          {seated && joinCode ? (
            <span className="font-mono text-xs font-bold tracking-[0.15em] text-ink-soft">
              <span className="sr-only">Join code </span>
              {joinCode}
            </span>
          ) : null}
          </span>
        </span>

        {seated ? (
          <span className="space-y-1.5">
            <span className="flex items-center justify-between text-xs font-semibold text-ink-soft">
              <span>{summary?.open ? `${summary.open} open` : "All served"}</span>
              {summary?.oldestOpenAt ? <OldestTimer since={summary.oldestOpenAt} /> : null}
            </span>
            <span className="perf block" />
            <span className="flex items-baseline justify-between">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink-soft">Check</span>
              <span className="font-mono text-base font-bold tabular">{formatCents(summary?.totalCents ?? 0)}</span>
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {capacity ? `${capacity} seats` : "Tap to seat"}
          </span>
        )}
      </button>
    );
  }
);

Table.displayName = "Table";

export default Table;
