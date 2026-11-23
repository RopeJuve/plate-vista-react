import type {
  CardReader,
  CardReaderPayment,
  CardReaderUnavailableReason,
  PaymentErrorBody,
} from "../../shared/api/payments";
import type { BillUnfrozenReason, SessionBill } from "../../shared/realtime/protocol";
import { formatCents } from "../../shared/money/formatCents";

const UNAVAILABLE: Record<CardReaderUnavailableReason, string> = {
  PAYOUT_ACCOUNT_NOT_READY: "The payout account can't take card payments yet.",
  TSE_NOT_ACTIVE: "The TSE is not active.",
  BILL_PAID: "Already paid.",
  BILL_EMPTY: "Nothing to pay.",
  PAYMENT_IN_PROGRESS: "A payment is already in progress.",
  NO_READER_AVAILABLE: "Every card reader is offline or busy.",
};

/** What the pay panel shows for "Card reader": nothing, a greyed button with why, or a reader to start on. */
export type CardReaderOption =
  | { available: true; reader: CardReader }
  | { available: false; reason: string };

const canTakePayment = (reader: CardReader) => reader.status === "online" && !reader.busyWith;

/**
 * The card reader option for a bill, as the API decides it; `null` when the button is hidden
 * (or the server says nothing about card readers). Until staff can pick, it is the first reader
 * that can take a payment.
 */
export const cardReaderOption = (bill: SessionBill): CardReaderOption | null => {
  const availability = bill.cardReader;
  if (!availability || availability.state === "HIDDEN") {
    return null;
  }
  const reader = availability.readers.find(canTakePayment);
  if (availability.state === "OFFERED" && reader) {
    return { available: true, reader };
  }
  const reason = availability.reason ? UNAVAILABLE[availability.reason] : UNAVAILABLE.NO_READER_AVAILABLE;
  return { available: false, reason };
};

/** The card reader payment the bill is waiting on right now, if any. */
export const cardReaderInProgress = (bill: SessionBill): CardReaderPayment | null =>
  !bill.payment && bill.cardReaderPayment?.status === "IN_PROGRESS" ? bill.cardReaderPayment : null;

/** The bill is frozen for a card reader payment (from the bill's `freeze`). */
export const isPayingOnCardReader = (bill: Pick<SessionBill, "freeze">) => bill.freeze?.kind === "CARD_READER";

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
            ? `The card reader is taking table ${tableNumber}’s payment.`
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

const ENDED: Partial<Record<BillUnfrozenReason, string>> = {
  CANCELLED: "The card reader payment was cancelled.",
  EXPIRED: "The card reader payment timed out: no card was presented.",
  STAFF_PAYMENT: "The card reader payment was stopped: staff recorded a payment or closed the table.",
};

/** What staff read when a card reader payment ends unpaid (a declined card is told elsewhere). */
export const cardReaderEndedNote = (reason: BillUnfrozenReason): string | null => ENDED[reason] ?? null;
