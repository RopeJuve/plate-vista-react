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

const VAT_RATE_LETTERS: Record<VatRate, string> = { NORMAL: "A", REDUCED_1: "B" };

/** The letter a German receipt marks each line's VAT rate with: A = 19 %, B = 7 %. */
export const vatRateLetter = (rate: VatRate) => VAT_RATE_LETTERS[rate];

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Bar",
  CARD_TERMINAL: "Karte",
  ONLINE: "Online",
};

export const paymentMethodLabel = (method: PaymentMethod) => PAYMENT_METHOD_LABELS[method];

/** Stripe's name for a word that is shown as is, e.g. `revolut_pay` → "Revolut Pay". */
const titleCase = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const CARD_BRANDS: Record<string, string> = {
  amex: "AMEX",
  cartes_bancaires: "CB",
  diners: "DINERS",
  discover: "DISCOVER",
  eftpos_au: "EFTPOS",
  jcb: "JCB",
  mastercard: "MASTERCARD",
  unionpay: "UNIONPAY",
  visa: "VISA",
};

/** The card brand as printed on the receipt's chip, e.g. `mastercard` → "MASTERCARD". */
export const cardBrandLabel = (brand: string | undefined) =>
  brand ? CARD_BRANDS[brand] ?? brand.replace(/_/g, " ").toUpperCase() : "KARTE";

const WALLETS: Record<string, string> = {
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  samsung_pay: "Samsung Pay",
  link: "Link",
};

export const walletLabel = (wallet: string) => WALLETS[wallet] ?? titleCase(wallet);

const FUNDING: Record<string, string> = { credit: "Kredit", debit: "Debit", prepaid: "Prepaid" };

/** Kredit, Debit or Prepaid; nothing when Stripe does not know. */
export const fundingLabel = (funding: string | undefined) => (funding ? FUNDING[funding] ?? null : null);

const PAYMENT_METHOD_TYPES: Record<string, string> = {
  amazon_pay: "Amazon Pay",
  bancontact: "Bancontact",
  card: "Karte",
  eps: "EPS",
  giropay: "giropay",
  ideal: "iDEAL",
  klarna: "Klarna",
  link: "Link",
  paypal: "PayPal",
  revolut_pay: "Revolut Pay",
  sepa_debit: "SEPA-Lastschrift",
  sofort: "Sofort",
};

/** A Stripe payment method type as the guest knows it, e.g. `sepa_debit` → "SEPA-Lastschrift". */
export const paymentMethodTypeLabel = (type: string) => PAYMENT_METHOD_TYPES[type] ?? titleCase(type);

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

/** The Service Period as printed: "07.11.2026, 19:05:12 – 07.11.2026, 20:30:00". */
export const formatServicePeriod = ({ start, end }: { start: string; end: string }) =>
  `${formatReceiptDateTime(start)} – ${formatReceiptDateTime(end)}`;

/** `GET /receipts/:token` answered 404: the link is wrong or the receipt does not exist. */
export const isReceiptMissing = (error: unknown) =>
  (error as { response?: { status?: number } } | null)?.response?.status === 404;
