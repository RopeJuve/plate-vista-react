import { useRealtime } from "../../../shared/realtime/RealtimeProvider";
import { requestErrorMessage } from "../../../shared/realtime/errorMessages";
import { ProtocolError, type Order, type OrderCreateItemInput } from "../../../shared/realtime/protocol";
import { notify } from "../../../utils/notify";
import { useGuestBill } from "../GuestBillProvider";

/**
 * What a guest can do to an order already on their bill. The server answers
 * with the order as it now stands, which goes straight onto the bill. Both
 * actions report their own errors and resolve false when nothing changed.
 * A paid bill takes no changes; a `BILL_PAID` refusal locks it.
 */
export const useGuestOrderActions = () => {
  const { request, status } = useRealtime();
  const { rememberOrder, paid, markPaid } = useGuestBill();

  const settle = async (sent: Promise<{ order?: Order } | undefined>, fallback: string) => {
    try {
      const data = await sent;
      if (data?.order) {
        rememberOrder(data.order);
      }
      return true;
    } catch (error) {
      if (error instanceof ProtocolError && error.code === "BILL_PAID") {
        markPaid();
      }
      notify(requestErrorMessage(error, fallback));
      return false;
    }
  };

  return {
    canSend: status === "open" && !paid,
    updateOrder: (orderId: string, items: OrderCreateItemInput[]) =>
      settle(request<"order.update", { order?: Order }>("order.update", { orderId, items }), "Could not update the order"),
    cancelOrder: (orderId: string, reason: string) =>
      settle(request<"order.cancel", { order?: Order }>("order.cancel", { orderId, reason }), "Could not cancel the order"),
  };
};
