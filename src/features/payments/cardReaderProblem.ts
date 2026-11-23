import type { PaymentErrorBody } from "../../shared/api/payments";
import { formatCents } from "../../shared/money/formatCents";

const errorAnswer = (error: unknown) =>
  (error as { response?: { status?: number; data?: Partial<PaymentErrorBody> } } | null)?.response;

/** Why starting a card reader payment failed, and whether the bill on screen is out of date. */
export type CardReaderProblem = { message: string; reloadsBill: boolean };

const detail = <T>(data: Partial<PaymentErrorBody> | undefined, key: string): T | undefined =>
  (data?.details?.[key] ?? (data as Record<string, unknown> | undefined)?.[key]) as T | undefined;

/** A contract error from `POST /sessions/:id/card-reader-payment` (or its test card), in words staff can act on. */
export const cardReaderProblem = (error: unknown): CardReaderProblem => {
  const answer = errorAnswer(error);
  if (!answer?.status) {
    return { message: "Could not reach the server. Try again.", reloadsBill: false };
  }
  const data = answer.data;
  switch (data?.code) {
    case "BILL_PAID":
      return { message: "Already paid.", reloadsBill: true };
    case "BILL_EMPTY":
      return { message: "Nothing to pay — close the table instead.", reloadsBill: true };
    case "BILL_CHANGED": {
      const totalCents = detail<number>(data, "totalCents");
      const total = typeof totalCents === "number" ? ` — new total ${formatCents(totalCents)}` : "";
      return { message: `The bill changed${total}. Please start again.`, reloadsBill: true };
    }
    case "PAYMENT_IN_PROGRESS": {
      const readerName = detail<string | null>(data, "readerName");
      const message =
        detail<string>(data, "kind") === "CARD_READER"
          ? `This bill is already being paid on ${readerName ? `the card reader “${readerName}”` : "a card reader"}.`
          : "A guest is paying this bill online right now.";
      return { message, reloadsBill: true };
    }
    case "CARD_READER_BUSY": {
      const tableNumber = detail<number | null>(data, "tableNumber");
      return {
        message:
          typeof tableNumber === "number"
            ? `This reader is busy with table ${tableNumber}.`
            : "The card reader is busy with another payment.",
        reloadsBill: true,
      };
    }
    case "CARD_READER_OFFLINE":
      return { message: "The card reader is offline. Check it is switched on and connected.", reloadsBill: true };
    case "CARD_READER_PAYMENT_UNAVAILABLE":
      return {
        message:
          detail<string>(data, "reason") === "TSE_NOT_ACTIVE"
            ? "Card reader payments need an active TSE."
            : "Card reader payments need a payout account that can take payments.",
        reloadsBill: true,
      };
    case "PAYMENT_PROVIDER_ERROR":
      return { message: "The card reader could not be reached through Stripe. Try again.", reloadsBill: false };
    case "STRIPE_NOT_CONFIGURED":
      return { message: "Card reader payments are not set up on the server.", reloadsBill: false };
    default:
      return { message: "Could not start the card reader payment. Try again.", reloadsBill: false };
  }
};

/** Why retrying a failed card reader payment did not start: as starting, or nothing left to retry (404). */
export const retryProblem = (error: unknown): CardReaderProblem =>
  errorAnswer(error)?.status === 404
    ? { message: "There is no failed card reader payment to retry any more.", reloadsBill: true }
    : cardReaderProblem(error);

/** Why cancelling a card reader payment failed; `reloadsBill` when the bill on screen is out of date. */
export const cancelCardReaderProblem = (error: unknown): CardReaderProblem => {
  const answer = errorAnswer(error);
  if (!answer?.status) {
    return { message: "Could not reach the server. Try again.", reloadsBill: false };
  }
  if (answer.data?.code === "BILL_PAID") {
    return { message: "The card already went through, so the bill is paid.", reloadsBill: true };
  }
  if (answer.status === 404) {
    return { message: "There is no card reader payment to cancel any more.", reloadsBill: true };
  }
  return { message: "Could not cancel the card reader payment. Try again.", reloadsBill: false };
};
