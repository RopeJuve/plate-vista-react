/**
 * Payments, legal details, TSE and receipts.
 *
 * Mirrors `docs/payments-contract.md` in plate-vista-api (#20). All paths are
 * under `/api/v1`; the tenant comes from the auth token. Amounts are integer cents.
 */

/** `NORMAL` is the standard German VAT rate, `REDUCED_1` the first reduced rate. */
export type VatRate = "NORMAL" | "REDUCED_1";

export type PaymentMethod = "CASH" | "CARD_TERMINAL" | "ONLINE";

/** State of the TSE signature on a payment. */
export type SignatureStatus = "PENDING" | "SIGNED" | "FAILED";

export interface LegalAddress {
  street: string;
  zip: string;
  city: string;
  country: "DE";
}

/** `GET/PUT /restaurant/legal`. PUT answers 400 VALIDATION on bad fields. */
export interface LegalDetails {
  legalName: string;
  address: LegalAddress;
  taxNumber?: string;
  vatId?: string;
}

/** `GET /tse`, `POST /tse/setup`. */
export interface TseStatus {
  active: boolean;
  tssSerial?: string;
  clientId?: string;
  setupAt?: string;
  /** How many payments/orders are waiting for a signature retry. */
  failedSignatures: number;
}

export type FailedSignatureKind = "PAYMENT" | "ORDER";

/** One row of `GET /tse/failed`. */
export interface FailedSignature {
  kind: FailedSignatureKind;
  id: string;
  tableNumber: number;
  at: string;
  amountCents: number;
  error: string;
  retryCount: number;
}

export interface FailedSignatureList {
  items: FailedSignature[];
}

/** `POST /tse/failed/:kind/:id/retry`. */
export interface RetrySignatureResult {
  status: SignatureStatus;
}

/** Body of `POST /sessions/:id/payments`. `clientPaymentId` makes a retry a replay (200). */
export interface PayBillBody {
  method: PaymentMethod;
  clientPaymentId: string;
  expectedTotalCents: number;
}

/** `POST /sessions/:id/payments` → 201 (new) or 200 (replay of the same clientPaymentId). */
export interface Payment {
  id: string;
  sessionId: string;
  method: PaymentMethod;
  amountCents: number;
  paidAt: string;
  receiptToken: string;
  signature: { status: SignatureStatus };
}

/** Body of `POST /sessions/:id/close` when an owner/admin closes an unpaid bill anyway. */
export interface CloseUnpaidBody {
  unpaidReason: string;
}

/**
 * `GET/PATCH /restaurant/payout-account` (owner only). The restaurant's own Stripe
 * account the online payments go to; its id and keys never reach the frontend.
 */
export interface PayoutAccount {
  /** A Payout Account was created: onboarding started. */
  connected: boolean;
  /** Stripe allows charges, so online payments can run. */
  chargesEnabled: boolean;
  /** The owner finished Stripe's form. */
  detailsSubmitted: boolean;
  /** The owner's switch, on by default. */
  onlinePaymentsEnabled: boolean;
}

/** `POST /restaurant/payout-account`: Stripe-hosted onboarding the browser is sent to. */
export interface PayoutOnboardingLink {
  url: string;
}

/** Body of `PATCH /restaurant/payout-account`. */
export interface OnlinePaymentsSwitchBody {
  onlinePaymentsEnabled: boolean;
}

/** Why a Late Payment was refunded instead of becoming a Payment. */
export type OnlinePaymentRefundReason = "BILL_ALREADY_PAID" | "BILL_NOT_FROZEN" | "SESSION_CLOSED";

/** A Late Payment, refunded in full automatically. */
export interface OnlinePaymentRefund {
  id: string;
  sessionId: string;
  tableNumber: number;
  amountCents: number;
  reason: OnlinePaymentRefundReason;
  refundedAt: string;
}

/** `GET /restaurant/online-payment-refunds`, newest first; `nextBefore` pages further back. */
export interface OnlinePaymentRefundList {
  items: OnlinePaymentRefund[];
  nextBefore: string | null;
}

/** `POST /sessions/:id/online-payment`: send the browser to `url`; `expiresAt` is at most 30 min away. */
export interface OnlinePaymentStart {
  url: string;
  expiresAt: string;
}

/** `GET /sessions/:id/receipt-token` → 200: the bill is paid, here is its receipt. */
export interface ReceiptTokenPaid {
  receiptToken: string;
}

/** `GET /sessions/:id/receipt-token` → 202: an online payment is still going through. 404: the bill is not paid. */
export interface ReceiptTokenPaying {
  status: "PAYING";
}

/** Error codes of the online payment endpoints (and `BILL_FROZEN` for orders on a frozen bill). */
export type OnlinePaymentErrorCode =
  | "STRIPE_NOT_CONFIGURED"
  | "ONLINE_PAYMENT_UNAVAILABLE"
  | "PAYMENT_PROVIDER_ERROR"
  | "BILL_FROZEN"
  | "BILL_PAYING_ONLINE";

/** Error codes the payment, close and TSE endpoints answer with. */
export type PaymentErrorCode =
  | OnlinePaymentErrorCode
  | "VALIDATION"
  | "BILL_PAID"
  | "BILL_CHANGED"
  | "BILL_UNPAID"
  | "BILL_EMPTY"
  | "TSE_NOT_ACTIVE"
  | "RESTAURANT_DETAILS_MISSING"
  | "TSE_SETUP_FAILED"
  | "NOT_FOUND";

/** Error body; `BILL_CHANGED` carries the server's current `totalCents`. */
export interface PaymentErrorBody {
  code: PaymentErrorCode;
  message?: string;
  totalCents?: number;
}

export interface ReceiptLine {
  title: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  vatRate: VatRate;
}

export interface ReceiptVatTotal {
  vatRate: VatRate;
  netCents: number;
  vatCents: number;
  grossCents: number;
}

export interface ReceiptSignature {
  status: SignatureStatus;
  txNumber?: number;
  timeStart?: string;
  timeEnd?: string;
  value?: string;
  counter?: number;
  tssSerial?: string;
  clientSerial?: string;
  qrCodeData?: string;
}

/** `GET /receipts/:token` (public) → Receipt | 404. */
export interface Receipt {
  restaurant: {
    name: string;
    legalName: string;
    address: LegalAddress;
    taxNumber?: string;
    vatId?: string;
  };
  lines: ReceiptLine[];
  totalsByVat: ReceiptVatTotal[];
  totalCents: number;
  method: PaymentMethod;
  paidAt: string;
  signature: ReceiptSignature;
}
