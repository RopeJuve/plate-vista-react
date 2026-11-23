/**
 * Payments, legal details, TSE and receipts.
 *
 * Mirrors `docs/payments-contract.md` in plate-vista-api (#20). All paths are
 * under `/api/v1`; the tenant comes from the auth token. Amounts are integer cents.
 */

/** `NORMAL` is the standard German VAT rate, `REDUCED_1` the first reduced rate. */
export type VatRate = "NORMAL" | "REDUCED_1";

/** `CARD_READER` is recorded only by Stripe's webhook, never sent by the staff app. */
export type PaymentMethod = "CASH" | "CARD_TERMINAL" | "CARD_READER" | "ONLINE";

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
  /** CARD_READER only, when Stripe could be read; null (or absent from older servers) for every other method. */
  paymentDetails?: CardPresentDetails | null;
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

/** A Stripe smart reader the restaurant takes card payments on. Ids are ours, not Stripe's. */
export interface CardReader {
  id: string;
  /** 1–40 characters, chosen by the owner or admin; need not be unique. */
  name: string;
  /** Stripe's device type, e.g. `stripe_s700`, `bbpos_wisepos_e`, `simulated_wisepos_e`. */
  deviceType: string;
  serialNumber: string;
  /** As Stripe last reported it, at most 30 s old. */
  status: "online" | "offline";
  /** A Simulated Reader, which only exists in test mode. */
  simulated: boolean;
  /** The bill whose card reader payment it is taking now. */
  busyWith: { sessionId: string; tableNumber: number } | null;
  addedAt: string;
}

/**
 * `GET /restaurant/card-readers` (owner, admin), sorted by name. `payoutAccountReady` is the
 * Payout Account's `chargesEnabled`; `testMode` says whether Simulated Readers can be added.
 */
export interface CardReaderList {
  items: CardReader[];
  testMode: boolean;
  payoutAccountReady: boolean;
}

/** Body of `POST /restaurant/card-readers`: the code the reader shows on screen, and its name. */
export interface AddCardReaderBody {
  registrationCode: string;
  name: string;
}

/** Body of `POST /restaurant/card-readers/simulated`. */
export interface AddSimulatedReaderBody {
  name: string;
}

/** Error codes of the Card Reader endpoints. */
export type CardReaderErrorCode =
  | "STRIPE_NOT_CONFIGURED"
  | "VALIDATION"
  | "PAYOUT_ACCOUNT_NOT_READY"
  | "RESTAURANT_DETAILS_MISSING"
  | "CARD_READER_CODE_INVALID"
  | "SIMULATED_READER_LIVE_MODE"
  | "CARD_READER_BUSY"
  | "PAYMENT_PROVIDER_ERROR"
  | "NOT_FOUND";

/** Error body of the Card Reader endpoints; `CARD_READER_BUSY` names the table it is taking a payment for. */
export interface CardReaderErrorBody {
  code: CardReaderErrorCode;
  message?: string;
  details?: { tableNumber?: number };
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
  code: PaymentErrorCode | CardReaderPaymentErrorCode;
  message?: string;
  totalCents?: number;
  /** Card reader errors carry their extras here (`totalCents`, `kind`, `readerName`, `tableNumber`, `reason`). */
  details?: Record<string, unknown>;
}

/**
 * Card reader payments (Stripe Terminal), `docs/payments-contract.md` → "Card reader payments".
 * The API drives the reader; the staff app starts the payment and watches the events.
 * The reader itself is `CardReader` above.
 */

export type PaymentFailureReason =
  | "DECLINED"
  | "INSUFFICIENT_FUNDS"
  | "LOST_OR_STOLEN_CARD"
  | "EXPIRED_CARD"
  | "PROCESSING_ERROR"
  | "CANCELLED_ON_READER"
  | "READER_OFFLINE"
  | "OTHER";

/** One attempt to take a bill's payment on a reader. Once paid it is a Payment; once cancelled or expired it is gone. */
export interface CardReaderPayment {
  id: string;
  sessionId: string;
  reader: { id: string; name: string; simulated: boolean };
  /** The bill's total when the attempt started. */
  amountCents: number;
  status: "IN_PROGRESS" | "FAILED";
  failure: { reason: PaymentFailureReason; message: string } | null;
  startedAt: string;
  expiresAt: string;
}

/** Why the bill is frozen (session status `paying`). */
export interface BillFreeze {
  kind: "ONLINE" | "CARD_READER";
  /** CARD_READER only. */
  readerName: string | null;
  totalCents: number;
  expiresAt: string;
}

export type CardReaderUnavailableReason =
  | "PAYOUT_ACCOUNT_NOT_READY"
  | "TSE_NOT_ACTIVE"
  | "BILL_PAID"
  | "BILL_EMPTY"
  | "PAYMENT_IN_PROGRESS"
  | "NO_READER_AVAILABLE";

/** Whether the pay panel offers "Card reader": HIDDEN shows no button, DISABLED a greyed one with the reason. */
export interface CardReaderAvailability {
  state: "OFFERED" | "DISABLED" | "HIDDEN";
  /** DISABLED only. */
  reason: CardReaderUnavailableReason | null;
  /** [] when HIDDEN; online and not busy ones can be picked. */
  readers: CardReader[];
}

/** Body of `POST /sessions/:id/card-reader-payment`. */
export interface StartCardReaderPaymentBody {
  readerId: string;
  expectedTotalCents: number;
}

/** Stripe test cards a Simulated Reader can be shown (test mode only). */
export type TestCard =
  | "APPROVED"
  | "DECLINED"
  | "INSUFFICIENT_FUNDS"
  | "LOST_CARD"
  | "STOLEN_CARD"
  | "EXPIRED_CARD"
  | "PROCESSING_ERROR";

/** Error codes of the card reader payment endpoints, on top of the payment ones. */
export type CardReaderPaymentErrorCode =
  | "PAYMENT_IN_PROGRESS"
  | "CARD_READER_BUSY"
  | "CARD_READER_OFFLINE"
  | "CARD_READER_PAYMENT_UNAVAILABLE"
  | "CARD_READER_NOT_SIMULATED"
  | "SIMULATED_READER_LIVE_MODE";

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

/**
 * How the guest paid online or on a card reader, as Stripe saw it; kept when the payment was recorded.
 * `type` is Stripe's payment method type (`card`, `card_present`, `paypal`, `klarna`, ...);
 * the card fields only for cards, the EMV fields (`aid`, `applicationLabel`, `readMethod`) only for `card_present`.
 */
export interface ReceiptPaymentDetails {
  type: string;
  brand?: string;
  last4?: string;
  funding?: string;
  wallet?: string;
  authorizationCode?: string;
  /** EMV Application ID, e.g. "A0000000031010". */
  aid?: string;
  /** e.g. "VISA CREDIT". */
  applicationLabel?: string;
  /** contactless_emv | contact_emv | contactless_magstripe_mode | magnetic_stripe_fallback | magnetic_stripe_track2 */
  readMethod?: string;
  /** The Stripe PaymentIntent id. */
  transactionId?: string;
  authorizedAt?: string;
}

/** The card details a card reader Payment keeps from Stripe. */
export interface CardPresentDetails {
  type: "card_present";
  brand: string;
  last4: string;
  funding: string;
  authorizationCode?: string;
  aid?: string;
  applicationLabel?: string;
  readMethod: string;
  transactionId: string;
  authorizedAt: string;
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
  /** The TSE transaction number (ADR-0007); null until the payment is signed. */
  receiptNumber: number | null;
  tableNumber?: number;
  /** From the first order that was not wholly cancelled to the payment. */
  servicePeriod: { start: string; end: string };
  lines: ReceiptLine[];
  totalsByVat: ReceiptVatTotal[];
  totalCents: number;
  method: PaymentMethod;
  /** ONLINE or CARD_READER only, and only when Stripe could be read when the payment was recorded. */
  paymentDetails?: ReceiptPaymentDetails;
  paidAt: string;
  signature: ReceiptSignature;
}
