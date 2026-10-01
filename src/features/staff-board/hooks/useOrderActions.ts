import { useCallback } from "react";
import { useRealtime } from "../../../shared/realtime/RealtimeProvider";
import { requestErrorMessage } from "../../../shared/realtime/errorMessages";
import { ProtocolError, type OrderStatus, type Station } from "../../../shared/realtime/protocol";
import { apiMessage, notify } from "../../../utils/notify";
import api from "../../../services/api";
import { useStaffBoard } from "../StaffBoardProvider";

/** What staff can do to an order or a table. Every action reports its own errors and resolves false when nothing changed. */
export const useOrderActions = () => {
  const { request, status } = useRealtime();
  const { reload } = useStaffBoard();
  const canSend = status === "open";

  const changeStatus = useCallback(
    async (orderId: string, next: OrderStatus, station: Station) => {
      try {
        await request("order.status", { orderId, status: next, station });
        return true;
      } catch (error) {
        notify(requestErrorMessage(error, "Could not update the order"));
        // Someone else moved the ticket first: show the board as it really is.
        if (error instanceof ProtocolError && error.code === "INVALID_TRANSITION") {
          await reload();
        }
        return false;
      }
    },
    [reload, request]
  );

  const cancelTicket = useCallback(
    async (orderId: string, reason: string, station: Station) => {
      try {
        await request("order.cancel", { orderId, reason, station });
        return true;
      } catch (error) {
        notify(requestErrorMessage(error, "Could not cancel the ticket"));
        return false;
      }
    },
    [request]
  );

  const updateOrder = useCallback(
    async (orderId: string, items: { productId: string; quantity: number; notes?: string }[]) => {
      try {
        await request("order.update", { orderId, items });
        return true;
      } catch (error) {
        notify(requestErrorMessage(error, "Could not update the order"));
        return false;
      }
    },
    [request]
  );

  /** Closes the table's check. */
  const closeSession = useCallback(async (sessionId: string) => {
    try {
      await api.post(`/sessions/${sessionId}/close`);
      notify("Table closed", "success");
      return true;
    } catch (error) {
      notify(apiMessage(error, "Could not close the table"));
      return false;
    }
  }, []);

  return { canSend, changeStatus, cancelTicket, updateOrder, closeSession };
};
