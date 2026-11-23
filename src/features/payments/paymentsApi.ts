import api from "../../services/api";
import type {
  CardReaderPayment,
  PayBillBody,
  Payment,
  StartCardReaderPaymentBody,
  TestCard,
} from "../../shared/api/payments";

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

const cardReaderPaymentPath = (sessionId: string) => `/sessions/${encodeURIComponent(sessionId)}/card-reader-payment`;

/** `POST /sessions/:id/card-reader-payment`: the bill freezes and the reader asks for the card. */
export const startCardReaderPayment = async (sessionId: string, body: StartCardReaderPaymentBody) =>
  (await api.post<CardReaderPayment>(cardReaderPaymentPath(sessionId), body, { skipErrorToast: true })).data;

/**
 * `POST /sessions/:id/card-reader-payment/retry`: the FAILED attempt starts again on the same reader.
 * 404 when there is no FAILED attempt; otherwise every error of starting (BILL_CHANGED with the new total).
 */
export const retryCardReaderPayment = async (sessionId: string, expectedTotalCents: number) =>
  (
    await api.post<CardReaderPayment>(
      `${cardReaderPaymentPath(sessionId)}/retry`,
      { expectedTotalCents },
      { skipErrorToast: true }
    )
  ).data;

/** `POST /sessions/:id/card-reader-payment/test-card` (Simulated Reader, test mode): the outcome follows as events. */
export const presentTestCard = async (sessionId: string, card: TestCard) =>
  (await api.post<CardReaderPayment>(`${cardReaderPaymentPath(sessionId)}/test-card`, { card }, { skipErrorToast: true }))
    .data;

/**
 * `POST /sessions/:id/card-reader-payment/cancel`: the reader is cleared and the bill unfreezes
 * (`bill.unfrozen` CANCELLED follows). 409 BILL_PAID when the card already went through.
 */
export const cancelCardReaderPayment = async (sessionId: string) =>
  (
    await api.post<{ status: string }>(`${cardReaderPaymentPath(sessionId)}/cancel`, undefined, {
      skipErrorToast: true,
    })
  ).data;
