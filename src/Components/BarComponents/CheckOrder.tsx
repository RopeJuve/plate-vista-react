import { Pencil } from "lucide-react";
import type { OrderAmendment } from "../../features/order-amendment/hooks/useOrderAmendment";
import type { TrackedOrder } from "../../features/staff-board/boardState";
import { formatCents } from "../../shared/money/formatCents";
import { billedLines } from "../../shared/realtime/tickets";
import { clockTime } from "../../services/time";
import { QtyStepper, TicketSteps } from "../rail";

/** One order already sent from this table, with its progress and, until a station starts on it, an edit. */
const CheckOrder = ({
  order,
  amendment,
  canSend,
}: {
  order: TrackedOrder;
  amendment: OrderAmendment;
  canSend: boolean;
}) => {
  const editing = amendment.isAmending(order);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <TicketSteps order={order} audience="staff" className="flex-1" />
        <time className="font-mono text-xs text-ink-soft tabular" dateTime={order.createdAt}>
          Placed {clockTime(order.createdAt)}
        </time>
      </div>
      <ul className="space-y-1.5 font-mono text-[0.92rem]">
        {billedLines(order).map((item) => (
          <li key={`${order._id}-${item.productId}`} className="flex items-center gap-2">
            {editing ? (
              <QtyStepper
                value={amendment.quantityOf(order, item)}
                label={item.title}
                onDecrease={() => amendment.decrease(item)}
                onIncrease={() => amendment.increase(item)}
              />
            ) : (
              <span className="w-8 shrink-0 font-bold tabular">{item.quantity}×</span>
            )}
            <span className="min-w-0 flex-1 truncate">{item.title}</span>
            <span className="font-semibold tabular">{formatCents(item.lineTotalCents)}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-ink-soft">
          Subtotal <span className="tabular">{formatCents(order.totalCents)}</span>
        </span>
        {amendment.canAmend(order) && !editing && (
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-signal-ink hover:bg-signal/10"
            onClick={() => amendment.begin(order)}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit order
          </button>
        )}
        {editing && (
          <span className="flex gap-1">
            <button
              type="button"
              className="h-8 rounded-md px-3 text-sm font-semibold text-ink-soft hover:bg-ink/[0.06]"
              onClick={amendment.discard}
            >
              Discard
            </button>
            <button
              type="button"
              className="h-8 rounded-md bg-ink px-3 text-sm font-semibold text-paper disabled:opacity-40"
              disabled={!canSend}
              onClick={() => amendment.save(order)}
            >
              Save
            </button>
          </span>
        )}
      </div>
      <div className="perf" />
    </div>
  );
};

export default CheckOrder;
