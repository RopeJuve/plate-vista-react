import { useCallback } from "react";
import { useRealtime } from "../../../shared/realtime/RealtimeProvider";
import { requestErrorMessage } from "../../../shared/realtime/errorMessages";
import { ProtocolError, type OrderStatus, type Station } from "../../../shared/realtime/protocol";
import { apiMessage, notify } from "../../../utils/notify";
import api from "../../../services/api";
import { closeResult, type CloseResult } from "../closeTable";
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

  /**
   * Closes the table's check. An owner or admin passes `unpaidReason` to close a bill nobody paid.
   * A BILL_UNPAID answer resolves `"unpaid"` without a toast: the check reloads its bill and says so.
   */
  const closeSession = useCallback(async (sessionId: string, unpaidReason?: string): Promise<CloseResult> => {
    try {
      await api.post(`/sessions/${encodeURIComponent(sessionId)}/close`, unpaidReason ? { unpaidReason } : undefined);
      notify("Table closed", "success");
      return "closed";
    } catch (error) {
      const result = closeResult(error);
      if (result === "failed") {
        notify(apiMessage(error, "Could not close the table"));
      }
      return result;
    }
  }, []);

  return { canSend, changeStatus, cancelTicket, updateOrder, closeSession };
};
