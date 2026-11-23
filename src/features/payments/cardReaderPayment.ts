import type {
  CardReader,
  CardReaderPayment,
  CardReaderUnavailableReason,
  PaymentErrorBody,
  PaymentFailureReason,
  TestCard,
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

/** A reader in the pay panel's picker: whether staff can pick it, and why not. */
export type ReaderChoice = { reader: CardReader; selectable: boolean; note: string | null };

/** What the pay panel shows for "Card reader": a greyed button with why, or the readers to pick from. */
export type CardReaderOption =
  | { available: true; readers: ReaderChoice[] }
  | { available: false; reason: string; readers: ReaderChoice[] };

const READER_OFFLINE = "Reader offline – check its Wi-Fi";
const ALL_OFFLINE = "Every card reader is offline – check their Wi-Fi.";

const readerChoice = (reader: CardReader): ReaderChoice => {
  if (reader.status !== "online") {
    return { reader, selectable: false, note: READER_OFFLINE };
  }
  if (reader.busyWith) {
    return { reader, selectable: false, note: `Busy with table ${reader.busyWith.tableNumber}` };
  }
  return { reader, selectable: true, note: null };
};

const unavailableReason = (reason: CardReaderUnavailableReason | null, readers: ReaderChoice[]) => {
  if (reason && reason !== "NO_READER_AVAILABLE") {
    return UNAVAILABLE[reason];
  }
  const allOffline = readers.length > 0 && readers.every(({ reader }) => reader.status !== "online");
  return allOffline ? ALL_OFFLINE : UNAVAILABLE.NO_READER_AVAILABLE;
};

/**
 * The card reader option for a bill, as the API decides it; `null` when the button is hidden
 * (or the server says nothing about card readers). Every reader is listed; only online ones that
 * are not busy can be picked.
 */
export const cardReaderOption = (bill: SessionBill): CardReaderOption | null => {
  const availability = bill.cardReader;
  if (!availability || availability.state === "HIDDEN") {
    return null;
  }
  const readers = availability.readers.map(readerChoice);
  if (availability.state === "OFFERED" && readers.some(({ selectable }) => selectable)) {
    return { available: true, readers };
  }
  return { available: false, reason: unavailableReason(availability.reason, readers), readers };
};

/** The reader the picker starts on: the one this device used last if it can be picked, else the first that can. */
export const preselectedReaderId = (readers: ReaderChoice[], lastUsedId: string | null): string | null => {
  const selectable = readers.filter((choice) => choice.selectable);
  return (selectable.find(({ reader }) => reader.id === lastUsedId) ?? selectable[0])?.reader.id ?? null;
};

/** Whether the reader taking `payment` is online, as the bill last reported it; `null` when the bill doesn't say. */
export const readerOnline = (bill: SessionBill, payment: CardReaderPayment): boolean | null => {
  const reader = bill.cardReader?.readers.find(({ id }) => id === payment.reader.id);
  return reader ? reader.status === "online" : null;
};

/** The card reader payment the bill is waiting on right now, if any. */
export const cardReaderInProgress = (bill: SessionBill): CardReaderPayment | null =>
  !bill.payment && bill.cardReaderPayment?.status === "IN_PROGRESS" ? bill.cardReaderPayment : null;

/** The bill's last card reader attempt failed (declined, or the reader failed) and nothing replaced it yet. */
export const cardReaderFailed = (bill: SessionBill): CardReaderPayment | null =>
  !bill.payment && !bill.freeze && bill.cardReaderPayment?.status === "FAILED" ? bill.cardReaderPayment : null;

const FAILURE_TITLES: Partial<Record<PaymentFailureReason, string>> = {
  DECLINED: "Card declined",
  INSUFFICIENT_FUNDS: "Card declined: insufficient funds",
  LOST_OR_STOLEN_CARD: "Card declined: reported lost or stolen",
  EXPIRED_CARD: "Card declined: expired card",
  PROCESSING_ERROR: "Card network error",
  CANCELLED_ON_READER: "Cancelled on the reader",
  READER_OFFLINE: "Reader offline",
};

/** Why a card reader attempt failed, in a few words staff read at a glance; the server's sentence for anything else. */
export const cardReaderFailureTitle = (failure: CardReaderPayment["failure"]): string =>
  (failure && FAILURE_TITLES[failure.reason]) || failure?.message || "The card reader payment failed.";

/** The Stripe test cards a Simulated Reader can be shown that do not go through, as the developer buttons name them. */
export const DECLINED_TEST_CARDS: { card: Exclude<TestCard, "APPROVED">; label: string }[] = [
  { card: "DECLINED", label: "Generic decline" },
  { card: "INSUFFICIENT_FUNDS", label: "Insufficient funds" },
  { card: "LOST_CARD", label: "Lost card" },
  { card: "STOLEN_CARD", label: "Stolen card" },
  { card: "EXPIRED_CARD", label: "Expired card" },
  { card: "PROCESSING_ERROR", label: "Processing error" },
];

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

const ENDED: Partial<Record<BillUnfrozenReason, string>> = {
  CANCELLED: "The card reader payment was cancelled.",
  EXPIRED: "The card reader payment timed out: no card was presented.",
  STAFF_PAYMENT: "The card reader payment was stopped: staff recorded a payment or closed the table.",
};

/** What staff read when a card reader payment ends unpaid (a declined card is told elsewhere). */
export const cardReaderEndedNote = (reason: BillUnfrozenReason): string | null => ENDED[reason] ?? null;
