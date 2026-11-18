import axios from "axios";
import { plateVistaConfig } from "../../Config/plateVista.config";
import api from "../../shared/api/client";
import type { OnlinePaymentStart, ReceiptTokenPaid } from "../../shared/api/payments";

const onlinePaymentPath = (sessionId: string) => `/sessions/${encodeURIComponent(sessionId)}/online-payment`;

/**
 * POSTs as staff through the shared client, or as a guest with their table token,
 * the same way `fetchBill` does. Callers show their own errors.
 */
const post = async <T>(path: string, guestToken?: string): Promise<T> => {
  if (!guestToken) {
    return (await api.post<T>(path, undefined, { skipErrorToast: true })).data;
  }
  const base = String(plateVistaConfig.VITE_VERCEL_API_URL || "").replace(/\/$/, "");
  const { data } = await axios.post<T>(`${base}${path}`, undefined, {
    headers: { Authorization: `Bearer ${guestToken}` },
  });
  return data;
};

/**
 * `POST /sessions/:id/online-payment` → where to send the browser to pay, and when that
 * link expires. On a bill that is already frozen it answers with the same link again.
 */
export const startOnlinePayment = (sessionId: string, guestToken?: string) =>
  post<OnlinePaymentStart>(onlinePaymentPath(sessionId), guestToken);

/** `POST /sessions/:id/online-payment/cancel`: unfreezes the bill (also fine when it was not frozen). */
export const cancelOnlinePayment = async (sessionId: string, guestToken?: string): Promise<void> => {
  await post<unknown>(`${onlinePaymentPath(sessionId)}/cancel`, guestToken);
};

/** What the server says about a bill the guest just tried to pay online. */
export type ReceiptTokenAnswer =
  | { state: "PAID"; receiptToken: string }
  /** The payment is still going through: ask again. */
  | { state: "PAYING" }
  /** The bill is not paid and open again. */
  | { state: "NOT_PAID" };

/**
 * `GET /sessions/:id/receipt-token` with the guest's table token: 200 the receipt,
 * 202 still paying, 404 not paid. Anything else (or no answer) rejects.
 */
export const fetchReceiptToken = async (sessionId: string, guestToken: string): Promise<ReceiptTokenAnswer> => {
  const base = String(plateVistaConfig.VITE_VERCEL_API_URL || "").replace(/\/$/, "");
  const response = await axios.get<Partial<ReceiptTokenPaid>>(
    `${base}/sessions/${encodeURIComponent(sessionId)}/receipt-token`,
    {
      headers: { Authorization: `Bearer ${guestToken}` },
      validateStatus: (status) => status === 200 || status === 202 || status === 404,
    }
  );
  if (response.status === 404) {
    return { state: "NOT_PAID" };
  }
  const receiptToken = response.data?.receiptToken;
  return response.status === 200 && receiptToken ? { state: "PAID", receiptToken } : { state: "PAYING" };
};
