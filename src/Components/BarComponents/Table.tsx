import { memo, useId } from "react";
import { useNavigate } from "react-router-dom";
import { BellRing, Check, Users } from "lucide-react";
import type { TableSummary } from "../../features/staff-board/boardState";
import { isOverdue, TABLE_LATE_AFTER_MINUTES } from "../../features/staff-board/ticketTiming";
import { formatCents } from "../../shared/money/formatCents";
import { formatElapsed, minutesSince, useNow } from "../rail";
import { cn } from "@/lib/utils";

const OldestTimer = ({ since }: { since: string }) => {
  const now = useNow();
  const late = isOverdue(minutesSince(since, now), TABLE_LATE_AFTER_MINUTES);
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
    paid = false,
    payingOnline = false,
    waiterCalled = false,
    onCloseWaiterCall,
  }: {
    tableId: string;
    tableNumber: number;
    status?: string;
    capacity?: number;
    /** Code late guests need to join; waiters read it out. */
    joinCode?: string;
    summary?: TableSummary;
    /** The bill is settled; the table is only waiting to be closed. */
    paid?: boolean;
    /** A guest is paying the bill online right now, so the bill is frozen. */
    payingOnline?: boolean;
    /** Guests at this table asked for a waiter and nobody has answered yet. */
    waiterCalled?: boolean;
    /** Answers the call without opening the table. */
    onCloseWaiterCall?: () => void;
  }) => {
    const navigate = useNavigate();
    const seated = status === "occupied";
    const reserved = status === "reserved";
    const called = seated && waiterCalled;
    const calledId = useId();

    return (
      // The close button sits over the tile, not inside it: a button cannot hold another.
      <div className="relative">
      <button
        type="button"
        onClick={() => navigate(`/bar/table/${tableId}`)}
        aria-label={`Open table ${tableNumber}`}
        aria-describedby={called ? calledId : undefined}
        title={seated && joinCode ? `Join code ${joinCode}` : undefined}
        className={cn(
          "group relative flex h-36 w-full flex-col justify-between rounded-xl p-3.5 text-left transition-[transform,background-color,box-shadow] duration-200 ease-out-expo hover:-translate-y-0.5 active:translate-y-0",
          seated && "bg-paper text-ink shadow-[0_8px_20px_-8px_rgb(0_0_0/0.6)]",
          called && "ring-4 ring-alert",
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
          {called ? (
            <span
              id={calledId}
              className="flex items-center gap-1 whitespace-nowrap rounded bg-alert px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-paper motion-safe:animate-pulse"
            >
              <BellRing className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Waiter</span> called
            </span>
          ) : null}
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em]",
              seated && (paid || summary?.ready) ? "bg-pass text-ink" : "",
              seated && !paid && !summary?.ready ? "bg-ink text-paper" : "",
              reserved && "bg-amber text-ink",
              !seated && !reserved && "text-inherit"
            )}
          >
            {seated ? (paid ? "Paid" : summary?.ready ? `${summary.ready} ready` : "Seated") : reserved ? "Reserved" : "Free"}
          </span>
          {seated && payingOnline ? (
            <span className="rounded bg-signal px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink">
              Paying online
            </span>
          ) : null}
          {seated && joinCode ? (
            <span className="font-mono text-xs font-bold tracking-[0.15em] text-ink-soft">
              <span className="sr-only">Join code </span>
              {joinCode}
            </span>
          ) : null}
          </span>
        </span>

        {seated ? (
          // Under the Done button while the table is calling.
          <span className={cn("space-y-1.5", called && "invisible")}>
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
      {called && onCloseWaiterCall ? (
        <button
          type="button"
          onClick={onCloseWaiterCall}
          aria-label={`Close the waiter call at table ${tableNumber}`}
          className="absolute inset-x-2.5 bottom-2.5 flex h-11 items-center justify-center gap-1.5 rounded-lg bg-alert text-sm font-bold text-paper shadow-[0_4px_12px_-4px_rgb(0_0_0/0.5)] hover:bg-alert-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-paper"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Done
        </button>
      ) : null}
      </div>
    );
  }
);

Table.displayName = "Table";

export default Table;
