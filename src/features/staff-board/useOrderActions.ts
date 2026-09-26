import { useCallback } from "react";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import { errorMessage } from "../../shared/realtime/errorMessages";
import { ProtocolError, type OrderStatus } from "../../shared/realtime/protocol";
import { notify } from "../../utils/notify";
import api from "../../services/api";
import { useStaffBoard } from "./StaffBoardProvider";

export const useOrderActions = () => {
  const { request, status } = useRealtime();
  const { reload } = useStaffBoard();
  const canSend = status === "open";

  const changeStatus = useCallback(
    async (orderId: string, next: OrderStatus) => {
      try {
        await request("order.status", { orderId, status: next });
      } catch (error) {
        if (error instanceof ProtocolError) {
          notify(errorMessage(error.code, error.details, error.message));
          if (error.code === "INVALID_TRANSITION") {
            await reload();
          }
          return;
        }
        notify("Could not update the order");
      }
    },
    [reload, request]
  );

  const cancelOrder = useCallback(
    async (orderId: string, reason: string) => {
      try {
        await request("order.cancel", { orderId, reason });
      } catch (error) {
        if (error instanceof ProtocolError) {
          notify(errorMessage(error.code, error.details, error.message));
          return;
        }
        notify("Could not cancel the order");
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
        if (error instanceof ProtocolError) {
          notify(errorMessage(error.code, error.details, error.message));
          return false;
        }
        notify("Could not update the order");
        return false;
      }
    },
    [request]
  );

  const closeSession = useCallback(async (sessionId: string) => {
    await api.post(`/sessions/${sessionId}/close`);
  }, []);

  return { canSend, changeStatus, cancelOrder, updateOrder, closeSession };
};
