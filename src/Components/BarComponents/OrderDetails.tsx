import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronUp, Pencil, X } from "lucide-react";
import { useOrder } from "../../contexts/OrderContext";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { usePlaceOrder } from "../../features/guest-ordering/usePlaceOrder";
import { useOrderAmendment } from "../../features/order-amendment/useOrderAmendment";
import { useOrderActions } from "../../features/staff-board/useOrderActions";
import { useStaffBoard } from "../../features/staff-board/StaffBoardProvider";
import { formatCents, lineTotalCents, sumCents } from "../../shared/money/formatCents";
import { errorMessage } from "../../shared/realtime/errorMessages";
import { billedLines } from "../../shared/realtime/tickets";
import { notify } from "../../utils/notify";
import { QtyStepper, TicketSteps } from "../rail";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const OrderDetails = () => {
  const { tableId = "" } = useParams();
  const { menuItems, clearOrder, setQuantity, removeItemFromOrder } = useOrder();
  const { itemsById } = useMenu();
  const { state } = useStaffBoard();
  const { canSend, closeSession, updateOrder } = useOrderActions();
  const placeOrder = usePlaceOrder({
    storageKey: `staff:${tableId}`,
    lines: menuItems,
    menuById: itemsById,
    tableId,
    onPlaced: () => {
      clearOrder();
      notify("Order placed", "success");
    },
    onFailed: (error) => notify(errorMessage(error.code, error.details, error.message)),
  });
  const [confirmClose, setConfirmClose] = useState(false);
  const amendment = useOrderAmendment(updateOrder);
  const [sheetOpen, setSheetOpen] = useState(false);

  const table = state.tablesById[tableId];
  const sessionId = state.sessionIdByTable[tableId];
  const joinCode = sessionId ? state.sessionsById[sessionId]?.joinCode : undefined;
  const orders = useMemo(
    () =>
      Object.values(state.ordersById)
        .filter((order) => order.tableId === tableId && order.status !== "cancelled")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [state.ordersById, tableId]
  );
  const total = sumCents(orders.map((order) => order.totalCents));
  const padTotal = sumCents(
    menuItems.map((line) => lineTotalCents(itemsById[line.productId]?.priceCents ?? 0, line.quantity))
  );
  const padCount = menuItems.reduce((count, line) => count + line.quantity, 0);

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

  const tableLabel = `Table ${table?.tableNumber ?? ""}`.trim();

  return (
    <section
      aria-labelledby="check-title"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex max-h-[88dvh] flex-col rounded-t-2xl bg-paper text-ink shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.6)]",
        "lg:static lg:z-auto lg:max-h-none lg:min-h-0 lg:rounded-xl lg:shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6)]"
      )}
    >
      <header className="flex items-center gap-3 px-5 pb-3 pt-4">
        <h2 id="check-title" className="text-2xl font-black tracking-[-0.02em]">
          {tableLabel}
        </h2>
        {table?.capacity ? (
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">{table.capacity} seats</span>
        ) : null}
        {joinCode ? (
          <span className="rounded bg-ink/[0.06] px-2 py-1 font-mono text-xs font-bold tracking-[0.15em]">
            <span className="sr-only">Join code </span>
            {joinCode}
          </span>
        ) : null}
        <button
          type="button"
          className="ml-auto grid h-10 w-10 place-items-center rounded-md bg-ink/[0.06] lg:hidden"
          onClick={() => setSheetOpen((open) => !open)}
          aria-expanded={sheetOpen}
          aria-controls="check-lines"
          aria-label={sheetOpen ? "Hide check" : "Show check"}
        >
          <ChevronUp className={cn("h-5 w-5 transition-transform", sheetOpen && "rotate-180")} />
        </button>
      </header>
      <div className="perf mx-5" />

      <div
        id="check-lines"
        className={cn("min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4", !sheetOpen && "hidden lg:block")}
      >
        {orders.length === 0 && menuItems.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-soft">
            Nothing on this check yet. Tap items on the menu to start it.
          </p>
        )}

        {orders.map((order) => {
          const editing = amendment.isAmending(order);
          return (
            <div key={order._id} className="space-y-2">
              <div className="flex items-center gap-3">
                <TicketSteps order={order} audience="staff" className="flex-1" />
                <time className="font-mono text-xs text-ink-soft tabular" dateTime={order.createdAt}>
                  Placed {new Date(order.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
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
        })}

        {menuItems.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-signal-ink">Not sent yet</h3>
            <ul className="space-y-2">
              {menuItems.map((line) => {
                const title = itemsById[line.productId]?.title || "Item";
                return (
                  <li key={line.productId} className="flex items-center gap-2">
                    <QtyStepper
                      value={line.quantity}
                      label={title}
                      onDecrease={() => setQuantity(line.productId, line.quantity - 1)}
                      onIncrease={() => setQuantity(line.productId, line.quantity + 1)}
                    />
                    <span className="min-w-0 flex-1 truncate font-mono text-[0.92rem]">{title}</span>
                    <button
                      type="button"
                      className="grid h-10 w-10 place-items-center rounded-md text-ink-soft hover:bg-alert/10 hover:text-alert-ink"
                      onClick={() => removeItemFromOrder(line.productId)}
                      aria-label={`Remove ${title}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {placeOrder.cartIssue && <p className="text-sm font-semibold text-alert-ink">{placeOrder.cartIssue}</p>}
      </div>

      <footer className="space-y-3 border-t border-dashed border-ink/20 px-5 pb-5 pt-3">
        {padCount > 0 && (
          <div className="flex items-baseline gap-2 font-mono text-sm text-signal-ink">
            <span>New · {padCount}</span>
            <span className="leader" aria-hidden="true" />
            <span className="tabular">{formatCents(padTotal)}</span>
          </div>
        )}
        <div className="flex items-baseline gap-2 font-mono">
          <span className="text-sm font-bold uppercase tracking-[0.1em]">Total</span>
          <span className="leader" aria-hidden="true" />
          <span className="text-xl font-bold tabular">{formatCents(total)}</span>
        </div>
        {!canSend && (
          <p className="text-sm font-semibold text-signal-ink" role="status">
            Connecting…
          </p>
        )}
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button
            type="button"
            size="xl"
            onClick={placeOrder.place}
            disabled={!placeOrder.canPlace}
            title={canSend ? "" : "Connecting…"}
          >
            {placeOrder.phase === "sending" ? "Placing…" : placeOrder.phase === "error" ? "Retry order" : "Place order"}
          </Button>
          <Button
            type="button"
            size="xl"
            variant="outline"
            className="border-ink/20 px-4 hover:border-alert hover:bg-alert/10 hover:text-alert-ink"
            onClick={() => setConfirmClose(true)}
            disabled={!sessionId || !canSend}
          >
            Close table
          </Button>
        </div>
      </footer>

      <Dialog open={confirmClose} onOpenChange={setConfirmClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close table {table?.tableNumber}?</DialogTitle>
            <DialogDescription>Guests at this table will see a thank-you screen.</DialogDescription>
          </DialogHeader>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-sm font-bold uppercase tracking-[0.1em]">Total</span>
            <span className="leader" aria-hidden="true" />
            <span className="text-lg font-bold tabular">{formatCents(total)}</span>
          </div>
          <Button type="button" variant="destructive" size="lg" onClick={handleCloseTable}>
            Close table
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default OrderDetails;
