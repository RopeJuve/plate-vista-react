import type { PaymentMethod, SignatureStatus, VatRate } from "../../shared/api/payments";

/** How long a pending signature is checked every 2 s before it is treated as late. */
export const FAST_POLL_FOR_MS = 30_000;
const FAST_POLL_EVERY_MS = 2_000;
const SLOW_POLL_EVERY_MS = 30_000;

/** A pending signature is "late" once it has been waited on for 30 s, and then counts like a failed one. */
const isLate = (status: SignatureStatus, waitedMs: number) =>
  status === "FAILED" || (status === "PENDING" && waitedMs >= FAST_POLL_FOR_MS);

/**
 * When to fetch the receipt again: every 2 s while the signature is fresh,
 * every 30 s once it failed or is late, never once it is signed.
 */
export const receiptPollDelay = (status: SignatureStatus, waitedMs: number): number | null => {
  if (status === "SIGNED") {
    return null;
  }
  return isLate(status, waitedMs) ? SLOW_POLL_EVERY_MS : FAST_POLL_EVERY_MS;
};

/** What the guest reads in place of the TSE block while the receipt is not signed yet. */
export const signatureNotice = (status: SignatureStatus, waitedMs: number): string | null => {
  if (status === "SIGNED") {
    return null;
  }
  return isLate(status, waitedMs) ? "TSE-Signatur wird nachgereicht" : "Signatur wird erstellt…";
};

const VAT_RATE_LABELS: Record<VatRate, string> = { NORMAL: "19 %", REDUCED_1: "7 %" };

export const vatRateLabel = (rate: VatRate) => VAT_RATE_LABELS[rate];

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Bar",
  CARD_TERMINAL: "Karte",
  ONLINE: "Online",
};

export const paymentMethodLabel = (method: PaymentMethod) => PAYMENT_METHOD_LABELS[method];

const dateTimeFormat = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** A receipt time as printed in Germany, in German local time, e.g. "07.11.2026, 20:30:00". */
export const formatReceiptDateTime = (iso: string | undefined) => {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : dateTimeFormat.format(date);
};

/** `GET /receipts/:token` answered 404: the link is wrong or the receipt does not exist. */
export const isReceiptMissing = (error: unknown) =>
  (error as { response?: { status?: number } } | null)?.response?.status === 404;
