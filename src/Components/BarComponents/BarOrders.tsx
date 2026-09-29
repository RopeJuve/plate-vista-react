import { useId } from "react";
import { listOrders } from "../../features/staff-board/boardState";
import { useOrderActions } from "../../features/staff-board/useOrderActions";
import { useStaffBoard } from "../../features/staff-board/StaffBoardProvider";
import type { OrderStatus, Station } from "../../shared/realtime/protocol";
import OrderCard from "./OrderCard";

/** One lane of the rail: a steel bar with this status's chits hanging from it. */
const BarOrders = ({
  title,
  statuses,
  station,
  compact = false,
}: {
  title: string;
  statuses: OrderStatus[];
  station: Station | "all";
  compact?: boolean;
}) => {
  const { state } = useStaffBoard();
  const { canSend } = useOrderActions();
  const orders = listOrders(state, statuses, station);
  const headingId = useId();
  const shown = compact ? [...orders].reverse() : orders;

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
          className={
            orders.length && title === "New"
              ? "min-w-[1.75rem] rounded-full bg-signal px-2 text-center font-mono text-sm font-bold text-ink tabular"
              : "min-w-[1.75rem] rounded-full bg-white/10 px-2 text-center font-mono text-sm font-bold text-paper tabular"
          }
        >
          {orders.length}
        </span>
      </header>
      <div className="rail mx-2 h-2.5 shrink-0 rounded-full" aria-hidden="true" />
      <div className="-mt-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-6 pt-0">
        {shown.map(({ order, tableNumber }, index) => (
          <OrderCard
            key={`${order._id}:${order.status}`}
            order={order}
            tableNumber={tableNumber}
            canSend={canSend}
            compact={compact}
            delay={Math.min(index, 8) * 45}
          />
        ))}
        {orders.length === 0 && (
          <p className="mt-6 text-center font-mono text-xs uppercase tracking-[0.16em] text-steel-300">
            Rail is clear
          </p>
        )}
      </div>
    </section>
  );
};

export default BarOrders;
