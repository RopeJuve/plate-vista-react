import { format } from "date-fns/format";
import { isValid } from "date-fns/isValid";
import { parseISO } from "date-fns/parseISO";
import type { OnlinePaymentRefund, OnlinePaymentRefundReason } from "../../shared/api/payments";

const REASON_LABELS: Record<OnlinePaymentRefundReason, string> = {
  BILL_ALREADY_PAID: "Bill was already paid",
  BILL_NOT_FROZEN: "Payment arrived after it was cancelled",
  SESSION_CLOSED: "Table was already closed",
};

/** Why the API refunded a Late Payment, in words staff understand. */
export const refundReasonLabel = (reason: OnlinePaymentRefundReason) => REASON_LABELS[reason] ?? reason;

/** When the refund went out, in local time, e.g. 07.11.2026, 20:12. */
export const formatRefundedAt = (iso: string) => {
  if (!iso) {
    return "";
  }
  const date = parseISO(iso);
  return isValid(date) ? format(date, "dd.MM.yyyy, HH:mm") : "";
};

const has = (rows: OnlinePaymentRefund[], id: string) => rows.some((row) => row.id === id);

/** The list after a live refund: newest first, never twice. */
export const withNewerRefund = (rows: OnlinePaymentRefund[], refund: OnlinePaymentRefund) =>
  has(rows, refund.id) ? rows : [refund, ...rows];

/** The list after "Show more": the older page goes at the end, without rows already shown. */
export const withOlderRefunds = (rows: OnlinePaymentRefund[], older: OnlinePaymentRefund[]) => [
  ...rows,
  ...older.filter((refund) => !has(rows, refund.id)),
];
