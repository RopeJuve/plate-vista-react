import api from "../../services/api";
import type { PayBillBody, Payment } from "../../shared/api/payments";

export { fetchBill } from "../../shared/api/bill";

/**
 * `POST /sessions/:id/payments` → 201 (new) or 200 (replay of the same clientPaymentId).
 * The pay panel shows its own messages, so the client's generic toast stays off.
 */
export const payBill = async (sessionId: string, body: PayBillBody) =>
  (
    await api.post<Payment>(`/sessions/${encodeURIComponent(sessionId)}/payments`, body, {
      skipErrorToast: true,
    })
  ).data;
