import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import { errorMessage } from "../../shared/realtime/errorMessages";
import { ProtocolError, type Order, type OrderCreateItemInput } from "../../shared/realtime/protocol";
import { notify } from "../../utils/notify";
import { useGuestBill } from "./GuestBillProvider";

/**
 * What a guest can do to an order already on their bill. The server answers
 * with the order as it now stands, which goes straight onto the bill. Both
 * actions report their own errors and resolve false when nothing changed.
 */
export const useGuestOrderActions = () => {
  const { request, status } = useRealtime();
  const { rememberOrder } = useGuestBill();

  const settle = async (sent: Promise<{ order?: Order } | undefined>, fallback: string) => {
    try {
      const data = await sent;
      if (data?.order) {
        rememberOrder(data.order);
      }
      return true;
    } catch (error) {
      notify(error instanceof ProtocolError ? errorMessage(error.code, error.details, error.message) : fallback);
      return false;
    }
  };

  return {
    canSend: status === "open",
    updateOrder: (orderId: string, items: OrderCreateItemInput[]) =>
      settle(request<"order.update", { order?: Order }>("order.update", { orderId, items }), "Could not update the order"),
    cancelOrder: (orderId: string, reason: string) =>
      settle(request<"order.cancel", { order?: Order }>("order.cancel", { orderId, reason }), "Could not cancel the order"),
  };
};
