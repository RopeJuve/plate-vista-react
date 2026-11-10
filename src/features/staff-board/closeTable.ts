import type { PaymentErrorBody } from "../../shared/api/payments";
import type { SessionBill } from "../../shared/realtime/protocol";
import { isOwnerOrAdmin } from "../../shared/auth/roles";
import type { User } from "../../types";

export const RECORD_PAYMENT_FIRST = "Record the payment first";
export const BILL_NOT_PAID = "This bill isn't paid yet";

/** The bill as the check knows it: `undefined` while it loads, `null` when it could not be loaded. */
export type KnownBill = Pick<SessionBill, "totalCents" | "payment"> | null | undefined;

/**
 * Why "Close table" is off, or null when it may close. A paid bill or a 0 € bill closes;
 * a bill that could not be loaded is left to the server, which answers BILL_UNPAID.
 */
export const closeBlock = (bill: KnownBill): string | null => {
  if (bill === undefined) {
    return "Loading the bill…";
  }
  if (bill && !bill.payment && bill.totalCents > 0) {
    return RECORD_PAYMENT_FIRST;
  }
  return null;
};

/** Only an owner or admin may close a table whose bill was never paid. */
export const canCloseUnpaid = (user: User | null) => isOwnerOrAdmin(user);

/** How `POST /sessions/:id/close` went. `unpaid` means the bill on screen is out of date. */
export type CloseResult = "closed" | "unpaid" | "failed";

export const closeResult = (error: unknown): Exclude<CloseResult, "closed"> => {
  const answer = (error as { response?: { status?: number; data?: Partial<PaymentErrorBody> } } | null)?.response;
  return answer?.status === 409 && answer.data?.code === "BILL_UNPAID" ? "unpaid" : "failed";
};
