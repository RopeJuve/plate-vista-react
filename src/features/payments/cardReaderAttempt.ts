import type { CardReaderPayment, PaymentFailureReason } from "../../shared/api/payments";
import type { BillUnfrozenReason, SessionBill } from "../../shared/realtime/protocol";

/** What staff read for a reader that lost its connection, as a failure title and in the picker. */
export const READER_OFFLINE = "Reader offline";

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
  READER_OFFLINE,
};

/** Why a card reader attempt failed, in a few words staff read at a glance; the server's sentence for anything else. */
export const cardReaderFailureTitle = (failure: CardReaderPayment["failure"]): string =>
  (failure && FAILURE_TITLES[failure.reason]) || failure?.message || "The card reader payment failed.";

const ENDED: Partial<Record<BillUnfrozenReason, string>> = {
  CANCELLED: "The card reader payment was cancelled.",
  EXPIRED: "The card reader payment timed out: no card was presented.",
  STAFF_PAYMENT: "The card reader payment was stopped: staff recorded a payment or closed the table.",
};

/** What staff read when a card reader payment ends unpaid (a declined card is told elsewhere). */
export const cardReaderEndedNote = (reason: BillUnfrozenReason): string | null => ENDED[reason] ?? null;
