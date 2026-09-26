import { memo, useState } from "react";
import { timeSinceOrder } from "../../services/time";
import { Hourglass } from "lucide-react";
import { formatCents } from "../../shared/money/formatCents";
import { NEXT_STAFF_ACTION, ORDER_STATUS_LABEL } from "../../shared/realtime/protocol";
import type { TrackedOrder } from "../../features/staff-board/boardState";
import { useOrderActions } from "../../features/staff-board/useOrderActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OrderCard = memo(({
  order,
  tableNumber,
  canSend,
}: {
  order: TrackedOrder;
  tableNumber: number;
  canSend: boolean;
}) => {
  const { changeStatus, cancelOrder } = useOrderActions();
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const nextAction = NEXT_STAFF_ACTION[order.status];
  const canCancel = order.status === "pending" || order.status === "accepted";

  const handleCancel = async () => {
    await cancelOrder(order._id, reason.trim() || "Cancelled by staff");
    setReasonOpen(false);
    setReason("");
  };

  return (
    <div className="flex w-full space-y-1 rounded-lg bg-slate-100 p-2 text-left text-gray-500">
      <div className="flex-grow space-y-2">
        <h3 className="text-lg font-bold">Table {tableNumber}</h3>
        <div className="w-[80%] space-y-1">
          {order.items.map((item) => (
            <div className="flex items-center gap-2 font-semibold" key={`${order._id}-${item.productId}`}>
              <div className="flex-grow">
                {item.title} ({item.quantity})
              </div>
              <span className="rounded-2xl border border-gray-300 px-2 text-sm font-bold">
                {formatCents(item.lineTotalCents)}
              </span>
            </div>
          ))}
        </div>
        <span className="flex items-center gap-1 text-[0.785rem] font-semibold opacity-75">
          <Hourglass className="inline-block h-5 w-5" />
          {timeSinceOrder(order.createdAt)}
        </span>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm font-bold">
            <p>Total:</p>
            {formatCents(order.totalCents)}
          </span>
          <span className="text-xs italic">{ORDER_STATUS_LABEL[order.status]}</span>
        </div>
        {order.cancelReason && <p className="text-xs text-red-500">{order.cancelReason}</p>}
      </div>
      <div className="flex flex-col justify-between gap-2">
        {nextAction && (
          <button
            type="button"
            className="rounded-lg bg-green-500 px-3 py-2 text-sm text-white disabled:opacity-50"
            disabled={!canSend}
            title={canSend ? nextAction.label : "Connecting…"}
            onClick={() => changeStatus(order._id, nextAction.next)}
          >
            {nextAction.label}
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm text-red-500 disabled:opacity-50"
            disabled={!canSend}
            onClick={() => setReasonOpen(true)}
          >
            Cancel order
          </button>
        )}
      </div>
      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel order</DialogTitle>
          </DialogHeader>
          <label htmlFor={`reason-${order._id}`} className="text-sm">
            Reason
          </label>
          <textarea
            id={`reason-${order._id}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-24 w-full rounded-md border p-2"
            aria-label="Cancellation reason"
          />
          <button type="button" className="rounded-lg bg-red-500 px-3 py-2 text-white" onClick={handleCancel}>
            Confirm cancel
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
});

OrderCard.displayName = "OrderCard";

export default OrderCard;
