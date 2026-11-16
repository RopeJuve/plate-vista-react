import axios from "axios";
import { plateVistaConfig } from "../../Config/plateVista.config";
import api from "../../shared/api/client";
import type { OnlinePaymentStart } from "../../shared/api/payments";

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
