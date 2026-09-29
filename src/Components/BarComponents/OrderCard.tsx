import { memo, useState } from "react";
import { ChefHat, Wine } from "lucide-react";
import { formatCents } from "../../shared/money/formatCents";
import { NEXT_STAFF_ACTION, type OrderStatus } from "../../shared/realtime/protocol";
import type { TrackedOrder } from "../../features/staff-board/boardState";
import { useOrderActions } from "../../features/staff-board/useOrderActions";
import { Chit, StepRow, formatElapsed, minutesSince, useNow } from "../rail";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Minutes a ticket may sit in a status before it wears the hazard hatch. */
const OVERDUE_AFTER: Partial<Record<OrderStatus, number>> = {
  pending: 5,
  accepted: 15,
  preparing: 15,
  ready: 5,
};

const Timer = ({ since, overdueAfter }: { since: string; overdueAfter?: number }) => {
  const now = useNow();
  const overdue = overdueAfter !== undefined && minutesSince(since, now) >= overdueAfter;
  return (
    <span
      className={cn(
        "font-mono text-xl font-bold leading-none tabular",
        overdue ? "text-alert-ink" : "text-ink"
      )}
      aria-label={overdue ? "Overdue" : "Waiting"}
    >
      <time dateTime={since}>{formatElapsed(since, now)}</time>
    </span>
  );
};

const OverdueHatch = ({ since, after }: { since: string; after?: number }) => {
  const now = useNow();
  if (after === undefined || minutesSince(since, now) < after) {
    return null;
  }
  return <div className="hazard mx-4 mt-3 h-1.5 rounded-full" role="img" aria-label="Overdue" />;
};

const OrderCard = memo(({
  order,
  tableNumber,
  canSend,
  compact = false,
  delay = 0,
}: {
  order: TrackedOrder;
  tableNumber: number;
  canSend: boolean;
  compact?: boolean;
  delay?: number;
}) => {
  const { changeStatus, cancelOrder } = useOrderActions();
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const nextAction = NEXT_STAFF_ACTION[order.status];
  const canCancel = order.status === "pending" || order.status === "accepted";
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  const shortId = order._id.slice(-4).toUpperCase();

  const handleCancel = async () => {
    await cancelOrder(order._id, reason.trim() || "Cancelled by staff");
    setReasonOpen(false);
    setReason("");
  };

  if (compact) {
    return (
      <Chit clipped printed className="opacity-80" style={{ animationDelay: `${delay}ms` }}>
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <h3 className="text-base font-extrabold leading-none">
            <span>Table </span>
            <span>{tableNumber}</span>
          </h3>
          <span className="font-mono text-sm tabular text-ink-soft">
            {itemCount} items · {formatCents(order.totalCents)}
          </span>
        </div>
        <StepRow status={order.status} className="px-4 pt-2.5" />
      </Chit>
    );
  }

  return (
    <Chit clipped printed style={{ animationDelay: `${delay}ms` }}>
      <article aria-label={`Order for table ${tableNumber}`}>
        <div className="flex items-end justify-between gap-3 px-4 pt-4">
          <h3 className="flex items-baseline gap-1.5 leading-none">
            <span className="text-lg font-extrabold uppercase">Table </span>
            <span className="text-numeral font-black" style={{ fontVariationSettings: '"wdth" 78' }}>
              {tableNumber}
            </span>
          </h3>
          <div className="flex flex-col items-end gap-1.5 pb-0.5">
            <Timer since={order.createdAt} overdueAfter={OVERDUE_AFTER[order.status]} />
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-soft">
              #{shortId} · {itemCount} items
            </span>
          </div>
        </div>

        <OverdueHatch since={order.createdAt} after={OVERDUE_AFTER[order.status]} />
        <StepRow status={order.status} className="px-4 pt-3" />

        <div className="perf mx-4 mt-3" />

        <ul className="space-y-2 px-4 py-3 font-mono text-[0.95rem]">
          {order.items.map((item) => (
            <li key={`${order._id}-${item.productId}`}>
              <div className="flex items-start gap-2">
                <span className="w-8 shrink-0 font-bold tabular">{item.quantity}×</span>
                <span className="min-w-0 flex-1 font-medium leading-snug">{item.title}</span>
                {item.station === "bar" ? (
                  <Wine className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" aria-label="Bar" />
                ) : (
                  <ChefHat className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" aria-label="Kitchen" />
                )}
              </div>
              {item.notes && (
                <p className="ml-10 mt-0.5 rounded bg-amber/20 px-1.5 py-0.5 text-sm italic text-ink">
                  {item.notes}
                </p>
              )}
            </li>
          ))}
        </ul>

        {order.cancelReason && (
          <p className="mx-4 mb-2 rounded bg-alert/10 px-2 py-1 text-sm font-semibold text-alert-ink">
            {order.cancelReason}
          </p>
        )}

        <div className="perf mx-4" />
        <div className="flex items-baseline gap-2 px-4 py-2.5 font-mono text-sm">
          <span className="font-bold uppercase tracking-[0.08em]">Total</span>
          <span className="leader" aria-hidden="true" />
          <span className="font-bold tabular">{formatCents(order.totalCents)}</span>
        </div>

        {(nextAction || canCancel) && (
          <div className="space-y-1 px-3 pb-1">
            {nextAction && (
              <Button
                type="button"
                size="lg"
                className="w-full text-base"
                disabled={!canSend}
                title={canSend ? nextAction.label : "Connecting…"}
                onClick={() => changeStatus(order._id, nextAction.next)}
              >
                {nextAction.label}
              </Button>
            )}
            {canCancel && (
              <button
                type="button"
                className="h-9 w-full rounded-md text-sm font-semibold text-ink-soft transition-colors hover:bg-alert/10 hover:text-alert-ink disabled:opacity-40"
                disabled={!canSend}
                onClick={() => setReasonOpen(true)}
              >
                Cancel order
              </button>
            )}
          </div>
        )}
      </article>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel order</DialogTitle>
            <DialogDescription>
              Table {tableNumber} will see this reason on their bill.
            </DialogDescription>
          </DialogHeader>
          <label htmlFor={`reason-${order._id}`} className="text-sm font-semibold">
            Reason
          </label>
          <Textarea
            id={`reason-${order._id}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-24"
            placeholder="Out of stock, guest changed their mind…"
            aria-label="Cancellation reason"
          />
          <Button type="button" variant="destructive" size="lg" onClick={handleCancel}>
            Confirm cancel
          </Button>
        </DialogContent>
      </Dialog>
    </Chit>
  );
});

OrderCard.displayName = "OrderCard";

export default OrderCard;
