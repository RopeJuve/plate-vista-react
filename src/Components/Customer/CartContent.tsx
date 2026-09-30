import { useState } from "react";
import { MessageSquarePlus, Pencil, Trash2 } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { useGuestBill } from "../../features/guest-ordering/GuestBillProvider";
import type { PlaceOrderPhase } from "../../features/guest-ordering/usePlaceOrder";
import { formatCents, lineTotalCents, sumCents } from "../../shared/money/formatCents";
import { LIMITS } from "../../shared/realtime/protocol";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import { errorMessage } from "../../shared/realtime/errorMessages";
import { ProtocolError } from "../../shared/realtime/protocol";
import { TICKET_LABEL, isUntouched, ticketsOf } from "../../shared/realtime/tickets";
import { Chit, QtyStepper, TicketSteps } from "../rail";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TotalLine = ({ label, cents, strong = false }: { label: string; cents: number; strong?: boolean }) => (
  <div className={cn("flex items-baseline gap-2 font-mono", strong ? "text-lg" : "text-sm text-ink-soft")}>
    <span className={cn("uppercase tracking-[0.1em]", strong ? "text-sm font-bold text-ink" : "")}>{label}</span>
    <span className="leader" aria-hidden="true" />
    <span className="font-bold tabular">{formatCents(cents)}</span>
  </div>
);

const CartContent = ({
  variant,
  handleSendMessages,
  pending,
  statusMessage,
  canSend,
  blocking,
  highlightedIds,
  fieldErrors,
  phase,
}: {
  variant: string;
  handleSendMessages: () => void;
  pending: boolean;
  statusMessage: string;
  canSend: boolean;
  blocking: boolean;
  highlightedIds: string[];
  fieldErrors: Record<string, string>;
  phase: PlaceOrderPhase;
}) => {
  const { cart, clearCart, setQuantity, setNotes, removeLine } = useCart();
  const { itemsById } = useMenu();
  const { orders, rememberOrder } = useGuestBill();
  const { request, status } = useRealtime();
  const [editingId, setEditingId] = useState("");
  const [draftQty, setDraftQty] = useState<Record<string, number>>({});
  const [noteOpen, setNoteOpen] = useState<Record<string, boolean>>({});
  const estimated = sumCents(
    cart.map((line) => lineTotalCents(itemsById[line.productId]?.priceCents ?? 0, line.quantity))
  );
  const payable = sumCents(orders.filter((order) => order.status !== "cancelled").map((order) => order.totalCents));
  const buttonLabel =
    phase === "sending" ? "Placing…" : phase === "error" ? "Retry order" : phase === "success" ? "Order placed" : "Order now";

  const handleCancel = async (orderId: string) => {
    const reason = window.prompt("Why are you cancelling this order?") || "";
    try {
      const data = await request<"order.cancel", { order: (typeof orders)[number] }>("order.cancel", {
        orderId,
        reason,
      });
      if (data?.order) {
        rememberOrder(data.order);
      }
    } catch (error) {
      if (error instanceof ProtocolError) {
        window.alert(errorMessage(error.code, error.details, error.message));
      }
    }
  };

  if (variant === "cart") {
    return (
      <>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2">
          {statusMessage && (
            <p
              className={cn(
                "mb-3 rounded-md px-3 py-2 text-center text-sm font-semibold",
                phase === "success" ? "bg-pass/10 text-pass-ink" : phase === "error" || blocking ? "bg-alert/10 text-alert-ink" : "bg-ink/[0.05] text-ink-soft"
              )}
              role="status"
            >
              {statusMessage}
            </p>
          )}
          {Object.keys(fieldErrors).length > 0 && (
            <ul className="mb-3 list-disc rounded-md bg-alert/10 py-2 pl-8 pr-3 text-sm text-alert-ink">
              {Object.entries(fieldErrors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          )}
          {cart.length === 0 && !statusMessage && (
            <div className="py-10 text-center">
              <p className="text-lg font-bold">Cart is empty</p>
              <p className="mt-1 text-sm text-ink-soft">Add dishes from the menu, then send them to the kitchen from here.</p>
            </div>
          )}
          {cart.length > 0 && (
            <Chit lift="paper" innerClassName="bg-white px-4 pt-3">
              <ul>
                {cart.map((line, index) => {
                  const menuItem = itemsById[line.productId];
                  const title = menuItem?.title || "Unavailable item";
                  const highlighted = highlightedIds.includes(line.productId);
                  const showNote = noteOpen[line.productId] || Boolean(line.notes);
                  return (
                    <li
                      key={line.productId}
                      className={cn(
                        "border-b border-dashed border-ink/15 py-3 last:border-0",
                        highlighted && "-mx-2 rounded-md bg-alert/[0.07] px-2"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono font-bold leading-snug">{title}</p>
                          {highlighted && <p className="text-sm font-semibold text-alert-ink">Unavailable</p>}
                        </div>
                        <p className="font-mono font-bold tabular">
                          {formatCents(lineTotalCents(menuItem?.priceCents ?? 0, line.quantity))}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <QtyStepper
                          value={line.quantity}
                          label={title}
                          onDecrease={() => setQuantity(line.productId, line.quantity - 1)}
                          onIncrease={() => setQuantity(line.productId, line.quantity + 1)}
                        />
                        {!showNote && (
                          <button
                            type="button"
                            className="ml-2 inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-ink-soft hover:bg-ink/[0.06] hover:text-ink"
                            onClick={() => setNoteOpen((open) => ({ ...open, [line.productId]: true }))}
                          >
                            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
                            Note
                          </button>
                        )}
                        <button
                          type="button"
                          className="ml-auto grid h-10 w-10 place-items-center rounded-md text-ink-soft hover:bg-alert/10 hover:text-alert-ink"
                          onClick={() => removeLine(line.productId)}
                          aria-label={`Remove ${title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {showNote && (
                        <div className="mt-2">
                          <label className="flex justify-between text-xs font-semibold text-ink-soft" htmlFor={`notes-${line.productId}`}>
                            <span>Note for the kitchen</span>
                            <span className="font-mono tabular">
                              {line.notes.length}/{LIMITS.MAX_NOTES_LENGTH}
                            </span>
                          </label>
                          <textarea
                            id={`notes-${line.productId}`}
                            value={line.notes}
                            maxLength={LIMITS.MAX_NOTES_LENGTH}
                            onChange={(event) => setNotes(line.productId, event.target.value)}
                            placeholder="No onions, extra ice…"
                            rows={2}
                            className="mt-1 w-full resize-none rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-signal focus:ring-[3px] focus:ring-signal/20"
                            aria-label={`Notes for ${title}`}
                          />
                        </div>
                      )}
                      {fieldErrors[`items.${index}.quantity`] && (
                        <p className="text-sm text-alert-ink">{fieldErrors[`items.${index}.quantity`]}</p>
                      )}
                      {fieldErrors[`items.${index}.notes`] && (
                        <p className="text-sm text-alert-ink">{fieldErrors[`items.${index}.notes`]}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="perf mb-3 mt-1" />
              <TotalLine label="Total" cents={estimated} strong />
            </Chit>
          )}
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-ink/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <Button
            type="button"
            size="xl"
            onClick={handleSendMessages}
            disabled={cart.length === 0 || pending || blocking || !canSend}
            title={canSend ? "" : "Connecting…"}
          >
            {buttonLabel}
          </Button>
          <Button
            type="button"
            size="xl"
            variant="ghost"
            className="px-4 text-ink-soft"
            onClick={clearCart}
            disabled={cart.length === 0 || pending}
          >
            Clear cart
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-2">
        {orders.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-lg font-bold">No orders yet</p>
            <p className="mt-1 text-sm text-ink-soft">Everything you send to the kitchen shows up here, with its status.</p>
          </div>
        )}
        {orders.map((order) => {
          const editing = editingId === order._id;
          const tickets = ticketsOf(order);
          const split = tickets.length > 1;
          const cancelled = tickets.filter((ticket) => ticket.status === "cancelled");
          // Part of the order was cancelled: those lines stay visible, struck out.
          const struck = new Set(
            cancelled.length < tickets.length ? cancelled.map((ticket) => ticket.station) : []
          );
          return (
            <Chit key={order._id} lift="paper" printed innerClassName="bg-white px-4 pt-3">
              <section aria-label={`Order at ${new Date(order.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`}>
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <time className="font-mono text-xs text-ink-soft tabular" dateTime={order.createdAt}>
                    Placed {new Date(order.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  </time>
                  <TicketSteps
                    order={order}
                    audience="guest"
                    className={split ? "w-full" : "max-w-[14rem] flex-1"}
                  />
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
                  {order.items.map((item) => {
                    const quantity = editing ? draftQty[item.productId] ?? item.quantity : item.quantity;
                    return (
                      <li
                        key={`${order._id}-${item.productId}`}
                        className="flex items-center gap-3 border-b border-dashed border-ink/10 py-2 last:border-0"
                      >
                        {editing ? (
                          <QtyStepper
                            value={quantity}
                            label={item.title}
                            max={LIMITS.MAX_QUANTITY_PER_ITEM}
                            onDecrease={() =>
                              setDraftQty((current) => ({
                                ...current,
                                [item.productId]: Math.max(1, (current[item.productId] ?? item.quantity) - 1),
                              }))
                            }
                            onIncrease={() =>
                              setDraftQty((current) => ({
                                ...current,
                                [item.productId]: Math.min(LIMITS.MAX_QUANTITY_PER_ITEM, (current[item.productId] ?? item.quantity) + 1),
                              }))
                            }
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
                          className={cn(
                            "font-mono font-semibold tabular",
                            struck.has(item.station) && "text-ink-soft line-through"
                          )}
                        >
                          {formatCents(item.lineTotalCents)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {isUntouched(order) && status === "open" && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editing ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ink"
                        onClick={async () => {
                          try {
                            const data = await request<"order.update", { order: typeof order }>("order.update", {
                              orderId: order._id,
                              items: order.items.map((item) => ({
                                productId: item.productId,
                                quantity: draftQty[item.productId] ?? item.quantity,
                                notes: item.notes,
                              })),
                            });
                            if (data?.order) {
                              rememberOrder(data.order);
                            }
                            setEditingId("");
                          } catch (error) {
                            if (error instanceof ProtocolError) {
                              window.alert(errorMessage(error.code, error.details, error.message));
                            }
                          }
                        }}
                      >
                        Save changes
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-ink/15"
                      onClick={() => {
                        if (editing) {
                          setEditingId("");
                          return;
                        }
                        const next: Record<string, number> = {};
                        order.items.forEach((item) => {
                          next[item.productId] = item.quantity;
                        });
                        setDraftQty(next);
                        setEditingId(order._id);
                      }}
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
                        onClick={() => handleCancel(order._id)}
                      >
                        Cancel order
                      </Button>
                    )}
                  </div>
                )}
              </section>
            </Chit>
          );
        })}
      </div>
      <div className="border-t border-ink/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <TotalLine label="Total" cents={payable} strong />
        {orders.length > 0 && (
          <p className="mt-1 text-xs text-ink-soft">Cancelled items aren’t counted.</p>
        )}
      </div>
    </>
  );
};

export default CartContent;
