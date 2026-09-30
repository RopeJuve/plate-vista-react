import { useState } from "react";
import { Pencil } from "lucide-react";
import type { BillOrder } from "../../features/guest-ordering/billState";
import type { useOrderAmendment } from "../../features/order-amendment/hooks/useOrderAmendment";
import { formatCents } from "../../shared/money/formatCents";
import { LIMITS } from "../../shared/realtime/protocol";
import { TICKET_LABEL, droppedStations, ticketsOf } from "../../shared/realtime/tickets";
import { clockTime } from "../../services/time";
import { Chit, QtyStepper, TicketSteps } from "../rail";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** One order on the guest's bill: where each ticket stands, and the changes still open to the guest. */
const BillOrderCard = ({
  order,
  amendment,
  canSend,
  onCancel,
}: {
  order: BillOrder;
  amendment: ReturnType<typeof useOrderAmendment>;
  canSend: boolean;
  /** Resolves true once the order is cancelled. */
  onCancel: (orderId: string, reason: string) => Promise<boolean>;
}) => {
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const editing = amendment.isAmending(order);
  const tickets = ticketsOf(order);
  const split = tickets.length > 1;
  const cancelled = tickets.filter((ticket) => ticket.status === "cancelled");
  // Part of the order was cancelled: those lines stay visible, struck out.
  const struck = droppedStations(order);
  const placedAt = clockTime(order.createdAt);

  const confirmCancel = async () => {
    if (await onCancel(order._id, reason.trim())) {
      setCancelling(false);
      setReason("");
    }
  };

  return (
    <Chit lift="paper" printed innerClassName="bg-white px-4 pt-3">
      <section aria-label={`Order at ${placedAt}`}>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <time className="font-mono text-xs text-ink-soft tabular" dateTime={order.createdAt}>
            Placed {placedAt}
          </time>
          <TicketSteps order={order} audience="guest" className={split ? "w-full" : "max-w-[14rem] flex-1"} />
        </div>
        {cancelled.map((ticket) => {
          const what = split ? `${TICKET_LABEL.guest[ticket.station]} cancelled` : "";
          const text = [what, ticket.cancelReason].filter(Boolean).join(": ");
          return text ? (
            <p key={ticket.station} className="mt-2 rounded bg-alert/10 px-2 py-1 text-sm text-alert-ink">
              {text}
            </p>
          ) : null;
        })}
        <ul className="mt-2">
          {order.items.map((item) => (
            <li
              key={`${order._id}-${item.productId}`}
              className="flex items-center gap-3 border-b border-dashed border-ink/10 py-2 last:border-0"
            >
              {editing ? (
                <QtyStepper
                  value={amendment.quantityOf(order, item)}
                  label={item.title}
                  max={LIMITS.MAX_QUANTITY_PER_ITEM}
                  onDecrease={() => amendment.decrease(item)}
                  onIncrease={() => amendment.increase(item)}
                />
              ) : (
                <span className="w-8 shrink-0 font-mono font-bold tabular">{item.quantity}×</span>
              )}
              <span
                className={cn(
                  "min-w-0 flex-1 font-mono font-semibold",
                  struck.has(item.station) && "text-ink-soft line-through"
                )}
              >
                {item.title}
              </span>
              <span
                className={cn("font-mono font-semibold tabular", struck.has(item.station) && "text-ink-soft line-through")}
              >
                {formatCents(item.lineTotalCents)}
              </span>
            </li>
          ))}
        </ul>
        {amendment.canAmend(order) && canSend && !cancelling && (
          <div className="mt-2 flex flex-wrap gap-2">
            {editing ? (
              <Button type="button" size="sm" variant="ink" onClick={() => amendment.save(order)}>
                Save changes
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-ink/15"
              onClick={() => (editing ? amendment.discard() : amendment.begin(order))}
            >
              {editing ? (
                "Discard"
              ) : (
                <>
                  <Pencil aria-hidden="true" />
                  Edit
                </>
              )}
            </Button>
            {!editing && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-alert-ink hover:bg-alert/10 hover:text-alert-ink"
                onClick={() => setCancelling(true)}
              >
                Cancel order
              </Button>
            )}
          </div>
        )}
        {amendment.canAmend(order) && canSend && cancelling && (
          <div className="mt-2">
            <label className="text-xs font-semibold text-ink-soft" htmlFor={`cancel-reason-${order._id}`}>
              Why are you cancelling this order?
            </label>
            <textarea
              id={`cancel-reason-${order._id}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Optional"
              rows={2}
              className="mt-1 w-full resize-none rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-signal focus:ring-[3px] focus:ring-signal/20"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="destructive" onClick={confirmCancel}>
                Cancel order
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-ink/15"
                onClick={() => setCancelling(false)}
              >
                Keep order
              </Button>
            </div>
          </div>
        )}
      </section>
    </Chit>
  );
};

export default BillOrderCard;
