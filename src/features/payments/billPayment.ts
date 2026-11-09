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
  ONLINE: "Online",
};

export const methodLabel = (method: PaymentMethod) => METHOD_LABEL[method];

/** Only an unpaid bill with something on it can be paid; an empty one is closed instead. */
export const canPayBill = (bill: SessionBill) => !bill.payment && bill.totalCents > 0;

/** Why `POST /sessions/:id/payments` did not record a payment. Only `NETWORK` is retried with the same id. */
export type PayProblem =
  | { kind: "BILL_CHANGED"; totalCents?: number }
  | { kind: "BILL_PAID" }
  | { kind: "TSE_NOT_ACTIVE" }
  | { kind: "BILL_EMPTY" }
  | { kind: "NETWORK" }
  | { kind: "FAILED" };

const errorAnswer = (error: unknown) =>
  (error as { response?: { status?: number; data?: Partial<PaymentErrorBody> } } | null)?.response;

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

/** The answer means the bill on screen is out of date, so it is loaded again. */
export const reloadsBill = (problem: PayProblem) => problem.kind === "BILL_CHANGED" || problem.kind === "BILL_PAID";

/** The guest-facing receipt page for a payment. */
export const receiptPath = (receiptToken: string) => `/receipt/${encodeURIComponent(receiptToken)}`;

/** The full receipt link a guest's phone opens from the QR code. */
export const receiptUrl = (baseUrl: string, receiptToken: string) =>
  `${baseUrl.replace(/\/$/, "")}${receiptPath(receiptToken)}`;
