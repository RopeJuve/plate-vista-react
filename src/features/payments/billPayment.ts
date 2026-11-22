import type { PaymentErrorBody, PaymentMethod } from "../../shared/api/payments";
import type { SessionBill } from "../../shared/realtime/protocol";

/** The two ways staff record a payment at the table, in the order the buttons show. */
export const PAY_METHODS: ReadonlyArray<{ method: PaymentMethod; button: string }> = [
  { method: "CASH", button: "Paid in cash" },
  { method: "CARD_TERMINAL", button: "Paid by card" },
];

const METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Cash",
  CARD_TERMINAL: "Card",
  CARD_READER: "Card",
  ONLINE: "Online",
};

export const methodLabel = (method: PaymentMethod) => METHOD_LABEL[method];

/** Only an unpaid bill with something on it can be paid; an empty one is closed instead. */
export const canPayBill = (bill: SessionBill) => !bill.payment && bill.totalCents > 0;

/**
 * A guest is paying this bill online right now, so it is frozen; staff may still record cash or card.
 * A bill frozen for a card reader payment is not (a server before 2.7 sends no `freeze`: online).
 */
export const isGuestPayingOnline = (bill: SessionBill) =>
  !bill.payment && bill.session.status === "paying" && bill.freeze?.kind !== "CARD_READER";

/** What staff see when the guest's online payment got there first: the bill shows as paid once `bill.paid` arrives. */
export const PAID_ONLINE_MESSAGE = "The guest has just paid online.";

/** Why `POST /sessions/:id/payments` did not record a payment. Only `NETWORK` is retried with the same id. */
export type PayProblem =
  | { kind: "BILL_CHANGED"; totalCents?: number }
  | { kind: "BILL_PAID" }
  | { kind: "BILL_PAYING_ONLINE" }
  | { kind: "TSE_NOT_ACTIVE" }
  | { kind: "BILL_EMPTY" }
  | { kind: "NETWORK" }
  | { kind: "FAILED" };

const errorAnswer = (error: unknown) =>
  (error as { response?: { status?: number; data?: Partial<PaymentErrorBody> } } | null)?.response;

/**
 * 409 BILL_PAYING_ONLINE from paying, closing or unfreezing: the guest's online payment
 * was already going through, so the bill is about to be paid online.
 */
export const billPayingOnline = (error: unknown) => {
  const answer = errorAnswer(error);
  return answer?.status === 409 && answer.data?.code === "BILL_PAYING_ONLINE";
};

export const payProblem = (error: unknown): PayProblem => {
  const answer = errorAnswer(error);
  if (!answer?.status) {
    return { kind: "NETWORK" };
  }
  const code = answer.data?.code;
  if (answer.status === 409 && code === "BILL_CHANGED") {
    const totalCents = answer.data?.totalCents;
    return typeof totalCents === "number" ? { kind: "BILL_CHANGED", totalCents } : { kind: "BILL_CHANGED" };
  }
  if (answer.status === 409 && code === "BILL_PAID") {
    return { kind: "BILL_PAID" };
  }
  if (answer.status === 409 && code === "BILL_PAYING_ONLINE") {
    return { kind: "BILL_PAYING_ONLINE" };
  }
  if (answer.status === 412 && code === "TSE_NOT_ACTIVE") {
    return { kind: "TSE_NOT_ACTIVE" };
  }
  if (answer.status === 422 && code === "BILL_EMPTY") {
    return { kind: "BILL_EMPTY" };
  }
  return { kind: "FAILED" };
};

/** The server never answered, or answered with something unexpected: confirming again replays the same payment. */
export const canRetryPayment = (problem: PayProblem) => problem.kind === "NETWORK" || problem.kind === "FAILED";

/** The answer means the bill on screen is out of date (or about to be paid online), so it is loaded again. */
export const reloadsBill = (problem: PayProblem) =>
  problem.kind === "BILL_CHANGED" || problem.kind === "BILL_PAID" || problem.kind === "BILL_PAYING_ONLINE";

/** The guest-facing receipt page for a payment. */
export const receiptPath = (receiptToken: string) => `/receipt/${encodeURIComponent(receiptToken)}`;

/** The full receipt link a guest's phone opens from the QR code. */
export const receiptUrl = (baseUrl: string, receiptToken: string) =>
  `${baseUrl.replace(/\/$/, "")}${receiptPath(receiptToken)}`;
