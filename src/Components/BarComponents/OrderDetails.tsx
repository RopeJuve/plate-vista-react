import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useOrder } from "../../contexts/OrderContext";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { checkCart } from "../../features/guest-ordering/cartLimits";
import { invalidatePendingIfCartChanged, toOrderItems } from "../../features/guest-ordering/pendingOrder";
import { usePlaceOrder } from "../../features/guest-ordering/usePlaceOrder";
import { useOrderActions } from "../../features/staff-board/useOrderActions";
import { useStaffBoard } from "../../features/staff-board/StaffBoardProvider";
import { formatCents, sumCents } from "../../shared/money/formatCents";
import { errorMessage } from "../../shared/realtime/errorMessages";
import { ORDER_STATUS_LABEL, ProtocolError } from "../../shared/realtime/protocol";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import { notify } from "../../utils/notify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OrderDetails = () => {
  const { tableId = "" } = useParams();
  const { menuItems, clearOrder, setQuantity, removeItemFromOrder } = useOrder();
  const { itemsById } = useMenu();
  const { state } = useStaffBoard();
  const { canSend, closeSession, updateOrder } = useOrderActions();
  const { status } = useRealtime();
  const storageKey = `staff:${tableId}`;
  const placeOrder = usePlaceOrder(storageKey);
  const [confirmClose, setConfirmClose] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [draftQty, setDraftQty] = useState<Record<string, number>>({});
  const issues = checkCart(menuItems, itemsById);

  const table = state.tablesById[tableId];
  const sessionId = state.sessionIdByTable[tableId];
  const orders = useMemo(
    () =>
      Object.values(state.ordersById)
        .filter((order) => order.tableId === tableId && order.status !== "cancelled")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [state.ordersById, tableId]
  );
  const total = sumCents(orders.map((order) => order.totalCents));

  useEffect(() => {
    invalidatePendingIfCartChanged(storageKey, toOrderItems(menuItems));
  }, [menuItems, storageKey]);

  const handleSendMessages = async () => {
    if (placeOrder.phase === "sending" || issues.blocking || menuItems.length === 0) {
      return;
    }
    try {
      await placeOrder.submit(toOrderItems(menuItems), tableId);
      clearOrder();
      notify("Order placed", "success");
      placeOrder.resetPhase();
    } catch (error) {
      if (error instanceof ProtocolError) {
        notify(errorMessage(error.code, error.details, error.message));
      }
    }
  };

  const handleCloseTable = async () => {
    if (!sessionId) {
      return;
    }
    try {
      await closeSession(sessionId);
      setConfirmClose(false);
      notify("Table closed", "success");
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      notify(message || "Could not close the table");
    }
  };

  const dot =
    status === "open" ? "bg-green-400" : status === "connecting" || status === "reconnecting" ? "bg-yellow-400" : "bg-red-400";

  return (
    <div className="col-span-2 flex flex-col justify-between rounded-lg bg-secondary-dark-bg">
      <div className="flex items-center justify-center gap-2">
        <h2 className="bg-secondary-dark-bg pb-1 text-center text-xl font-semibold uppercase">
          Table {table?.tableNumber ?? ""}
        </h2>
        <span className={`h-2 w-2 animate-pulse rounded-full ${dot}`} title={status === "open" ? "Online" : "Connecting…"} />
      </div>
      <div className="flex h-[70vh] flex-grow flex-col gap-1 overflow-y-scroll bg-main-dark-bg p-2">
        {orders.map((order) => (
          <div key={order._id} className="space-y-1 rounded-lg bg-slate-800 p-2">
            <div className="flex items-center justify-between text-xs">
              <span>{ORDER_STATUS_LABEL[order.status]}</span>
              <span>{formatCents(order.totalCents)}</span>
            </div>
            {order.items.map((item) => {
              const quantity = editingId === order._id ? draftQty[`${order._id}:${item.productId}`] ?? item.quantity : item.quantity;
              return (
                <div key={`${order._id}-${item.productId}`} className="flex items-center gap-4 py-1">
                  <p className="w-2/3 font-semibold">{item.title}</p>
                  {editingId === order._id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.title}`}
                        onClick={() =>
                          setDraftQty((current) => ({
                            ...current,
                            [`${order._id}:${item.productId}`]: Math.max(1, quantity - 1),
                          }))
                        }
                      >
                        −
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.title}`}
                        onClick={() =>
                          setDraftQty((current) => ({
                            ...current,
                            [`${order._id}:${item.productId}`]: Math.min(99, quantity + 1),
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <p className="flex-grow">{item.quantity}</p>
                  )}
                  <p className="font-semibold">{formatCents(item.lineTotalCents)}</p>
                </div>
              );
            })}
            {order.status === "pending" && (
              <button
                type="button"
                className="text-sm text-orange-300"
                onClick={() => {
                  const next: Record<string, number> = {};
                  order.items.forEach((item) => {
                    next[`${order._id}:${item.productId}`] = item.quantity;
                  });
                  setDraftQty(next);
                  setEditingId(order._id);
                }}
              >
                Edit order
              </button>
            )}
            {editingId === order._id && (
              <button
                type="button"
                className="text-sm text-white"
                disabled={!canSend}
                onClick={async () => {
                  const saved = await updateOrder(
                    order._id,
                    order.items.map((item) => ({
                      productId: item.productId,
                      quantity: draftQty[`${order._id}:${item.productId}`] ?? item.quantity,
                      notes: item.notes,
                    }))
                  );
                  if (saved) {
                    setEditingId("");
                  }
                }}
              >
                Save
              </button>
            )}
          </div>
        ))}
        {menuItems.map((line) => (
          <div key={line.productId} className="flex items-center justify-between p-2">
            <p>{itemsById[line.productId]?.title || "Item"}</p>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(line.productId, line.quantity - 1)}>
                −
              </button>
              <p>{line.quantity}</p>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(line.productId, line.quantity + 1)}>
                +
              </button>
              <button type="button" className="text-red-300" onClick={() => removeItemFromOrder(line.productId)}>
                Remove
              </button>
            </div>
          </div>
        ))}
        {issues.messages[0] && <p className="text-sm text-red-300">{issues.messages[0]}</p>}
        {!canSend && <p className="text-sm text-amber-200">Connecting…</p>}
      </div>
      <div className="flex flex-grow items-end justify-between p-2">
        <p>Total</p>
        <p>{formatCents(total)}</p>
      </div>
      <button
        type="button"
        className="w-full rounded-lg bg-blue-500 p-2 text-white disabled:opacity-50"
        onClick={handleSendMessages}
        disabled={menuItems.length === 0 || placeOrder.phase === "sending" || issues.blocking || !canSend}
        title={canSend ? "" : "Connecting…"}
      >
        {placeOrder.phase === "sending" ? "Placing…" : placeOrder.phase === "error" ? "Retry order" : "Place order"}
      </button>
      <button
        type="button"
        className="mt-2 w-full rounded-lg bg-red-500 p-2 text-white disabled:opacity-50"
        onClick={() => setConfirmClose(true)}
        disabled={!sessionId || !canSend}
      >
        Close table
      </button>
      <Dialog open={confirmClose} onOpenChange={setConfirmClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close table {table?.tableNumber}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Guests at this table will see a thank-you screen.</p>
          <button type="button" className="rounded-lg bg-red-500 px-3 py-2 text-white" onClick={handleCloseTable}>
            Close table
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetails;
