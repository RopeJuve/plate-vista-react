import { useState } from "react";
import { AlarmClock } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { useGuestBill } from "../../features/guest-ordering/GuestBillProvider";
import type { PlaceOrderPhase } from "../../features/guest-ordering/usePlaceOrder";
import { formatCents, lineTotalCents, sumCents } from "../../shared/money/formatCents";
import { LIMITS, ORDER_STATUS_LABEL } from "../../shared/realtime/protocol";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import { errorMessage } from "../../shared/realtime/errorMessages";
import { ProtocolError } from "../../shared/realtime/protocol";
import { cn } from "@/lib/utils";

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

  return (
    <>
      {variant === "cart" && (
        <div className="mt-4 max-h-[50vh] overflow-y-auto">
          {statusMessage && (
            <p className="mb-2 text-center text-sm" role="status">
              {statusMessage}
            </p>
          )}
          {Object.keys(fieldErrors).length > 0 && (
            <ul className="mb-2 list-disc pl-5 text-sm text-red-600">
              {Object.entries(fieldErrors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          )}
          {cart.length === 0 && !statusMessage && <p className="h-20 text-center">Cart is empty</p>}
          {cart.map((line, index) => {
            const menuItem = itemsById[line.productId];
            const highlighted = highlightedIds.includes(line.productId);
            return (
              <div
                key={line.productId}
                className={cn(
                  "border-b border-gray-200 py-2",
                  highlighted && "rounded-md bg-red-50 px-2"
                )}
              >
                <div className="flex items-center gap-3">
                  <p className="w-1/2 font-semibold">{menuItem?.title || "Unavailable item"}</p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${menuItem?.title || "item"}`}
                      className="h-8 w-8 rounded-md border"
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${menuItem?.title || "item"}`}
                      className="h-8 w-8 rounded-md border"
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <p className="ml-auto font-semibold">
                    {formatCents(lineTotalCents(menuItem?.priceCents ?? 0, line.quantity))}
                  </p>
                </div>
                {highlighted && <p className="text-sm text-red-600">Unavailable</p>}
                <label className="mt-1 block text-xs text-gray-500" htmlFor={`notes-${line.productId}`}>
                  Notes ({line.notes.length}/{LIMITS.MAX_NOTES_LENGTH})
                </label>
                <textarea
                  id={`notes-${line.productId}`}
                  value={line.notes}
                  maxLength={LIMITS.MAX_NOTES_LENGTH}
                  onChange={(event) => setNotes(line.productId, event.target.value)}
                  className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
                  aria-label={`Notes for ${menuItem?.title || "item"}`}
                />
                {fieldErrors[`items.${index}.quantity`] && (
                  <p className="text-sm text-red-600">{fieldErrors[`items.${index}.quantity`]}</p>
                )}
                {fieldErrors[`items.${index}.notes`] && (
                  <p className="text-sm text-red-600">{fieldErrors[`items.${index}.notes`]}</p>
                )}
                <button type="button" className="text-sm text-red-500" onClick={() => removeLine(line.productId)}>
                  Remove
                </button>
              </div>
            );
          })}
          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Total</h3>
            <h3 className="font-semibold">{formatCents(estimated)}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-orange-400 py-3 text-white disabled:opacity-50"
              onClick={handleSendMessages}
              disabled={cart.length === 0 || pending || blocking || !canSend}
              title={canSend ? "" : "Connecting…"}
            >
              {buttonLabel}
            </button>
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-red-400 py-3 text-white disabled:opacity-50"
              onClick={clearCart}
              disabled={cart.length === 0 || pending}
            >
              Clear cart
            </button>
          </div>
        </div>
      )}
      {variant === "bill" && (
        <>
          <div className="mt-4 max-h-[50vh] overflow-y-auto">
            {orders.length === 0 && <p className="py-6 text-center text-gray-500">No orders yet</p>}
            {orders.map((order) => (
              <section key={order._id} className="mb-3 rounded-lg border px-2 py-2">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <time dateTime={order.createdAt}>
                    {new Date(order.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  </time>
                  <span className="inline-flex items-center gap-1 italic">
                    <AlarmClock className="h-4 w-4" />
                    {ORDER_STATUS_LABEL[order.status]}
                    {order.cancelReason ? ` · ${order.cancelReason}` : ""}
                  </span>
                </div>
                {order.items.map((item) => {
                  const quantity = editingId === order._id ? draftQty[item.productId] ?? item.quantity : item.quantity;
                  return (
                    <div key={`${order._id}-${item.productId}`} className="flex items-center gap-3 border-b border-gray-100 py-2">
                      <p className="w-1/2 font-semibold">{item.title}</p>
                      {editingId === order._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="h-8 w-8 rounded border"
                            aria-label={`Decrease ${item.title}`}
                            onClick={() =>
                              setDraftQty((current) => ({
                                ...current,
                                [item.productId]: Math.max(1, (current[item.productId] ?? item.quantity) - 1),
                              }))
                            }
                          >
                            −
                          </button>
                          <span>{quantity}</span>
                          <button
                            type="button"
                            className="h-8 w-8 rounded border"
                            aria-label={`Increase ${item.title}`}
                            onClick={() =>
                              setDraftQty((current) => ({
                                ...current,
                                [item.productId]: Math.min(LIMITS.MAX_QUANTITY_PER_ITEM, (current[item.productId] ?? item.quantity) + 1),
                              }))
                            }
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <p>{item.quantity}</p>
                      )}
                      <p className="ml-auto font-semibold">{formatCents(item.lineTotalCents)}</p>
                    </div>
                  );
                })}
                {order.status === "pending" && status === "open" && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="rounded-md border px-2 py-1 text-sm"
                      onClick={() => {
                        if (editingId === order._id) {
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
                      Edit
                    </button>
                    <button type="button" className="rounded-md border px-2 py-1 text-sm text-red-600" onClick={() => handleCancel(order._id)}>
                      Cancel order
                    </button>
                  </div>
                )}
                {editingId === order._id && order.status === "pending" && (
                  <button
                    type="button"
                    className="mt-2 text-sm text-orange-600"
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
                  </button>
                )}
              </section>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Total</h3>
            <h3 className="font-semibold">{formatCents(payable)}</h3>
          </div>
        </>
      )}
    </>
  );
};

export default CartContent;
