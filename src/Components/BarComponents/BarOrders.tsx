import { useId } from "react";
import type { BoardLane } from "../../features/staff-board/boardLanes";
import { listTickets } from "../../features/staff-board/boardState";
import { useOrderActions } from "../../features/staff-board/hooks/useOrderActions";
import { useStaffBoard } from "../../features/staff-board/StaffBoardProvider";
import type { Station } from "../../shared/realtime/protocol";
import { cn } from "@/lib/utils";
import TicketCard from "./TicketCard";

/** One lane of the rail: a steel bar with the tickets at this status hanging from it. */
const BarOrders = ({ lane, station }: { lane: BoardLane; station: Station | "all" }) => {
  const { title, statuses, urgent = false, compact = false } = lane;
  const { state } = useStaffBoard();
  const { canSend } = useOrderActions();
  const tickets = listTickets(state, statuses, station);
  const headingId = useId();
  const shown = compact ? [...tickets].reverse() : tickets;

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-[60vh] snap-start flex-col rounded-xl bg-steel-850/70 xl:max-h-[calc(100dvh-9.5rem)]"
    >
      <header className="flex items-center justify-between px-4 pb-2 pt-3">
        <h2 id={headingId} className="text-sm font-extrabold uppercase tracking-[0.12em] text-paper">
          {title}
        </h2>
        <span
          className={cn(
            "min-w-[1.75rem] rounded-full px-2 text-center font-mono text-sm font-bold tabular",
            urgent && tickets.length ? "bg-signal text-ink" : "bg-white/10 text-paper"
          )}
        >
          {tickets.length}
        </span>
      </header>
      <div className="rail mx-2 h-2.5 shrink-0 rounded-full" aria-hidden="true" />
      <div className="-mt-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-6 pt-0">
        {shown.map(({ order, ticket, split, tableNumber }, index) => (
          <TicketCard
            key={`${order._id}:${ticket.station}:${ticket.status}`}
            order={order}
            ticket={ticket}
            split={split}
            tableNumber={tableNumber}
            canSend={canSend}
            compact={compact}
            delay={Math.min(index, 8) * 45}
          />
        ))}
        {tickets.length === 0 && (
          <p className="mt-6 text-center font-mono text-xs uppercase tracking-[0.16em] text-steel-300">
            Rail is clear
          </p>
        )}
      </div>
    </section>
  );
};

export default BarOrders;
