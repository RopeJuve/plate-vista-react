import type {
  CardReader,
  CardReaderErrorBody,
  CardReaderErrorCode,
  CardReaderList,
  CardReaderPayment,
  PaymentErrorBody,
} from "../../shared/api/payments";
import type { SessionBill } from "../../shared/realtime/protocol";
import { SESSION_ID, unpaidBill } from "./bill";

/** The contract's example readers: an S700 online, a WisePOS E offline, a busy Simulated Reader. */
export const cardReaders = {
  bar: {
    id: "6650c0ffee0000000000a001",
    name: "Bar",
    deviceType: "stripe_s700",
    serialNumber: "STRM26138003393",
    status: "online",
    simulated: false,
    busyWith: null,
    addedAt: "2026-11-20T09:12:00.000Z",
  },
  terrasse: {
    id: "6650c0ffee0000000000a002",
    name: "Terrasse",
    deviceType: "bbpos_wisepos_e",
    serialNumber: "WSC513105011295",
    status: "offline",
    simulated: false,
    busyWith: null,
    addedAt: "2026-11-20T09:15:00.000Z",
  },
  simulated: {
    id: "6650c0ffee0000000000a003",
    name: "Test reader",
    deviceType: "simulated_wisepos_e",
    serialNumber: "SIMULATED-1",
    status: "online",
    simulated: true,
    busyWith: { sessionId: "6650c0ffee0000000000b001", tableNumber: 4 },
    addedAt: "2026-11-21T14:00:00.000Z",
  },
} satisfies Record<string, CardReader>;

/** `GET /restaurant/card-readers` in each situation the section shows differently. */
export const cardReaderLists = {
  testMode: {
    items: [cardReaders.bar, cardReaders.terrasse, cardReaders.simulated],
    testMode: true,
    payoutAccountReady: true,
  },
  liveMode: {
    items: [cardReaders.bar, cardReaders.terrasse],
    testMode: false,
    payoutAccountReady: true,
  },
  empty: { items: [], testMode: false, payoutAccountReady: true },
  payoutNotReady: { items: [], testMode: true, payoutAccountReady: false },
} satisfies Record<string, CardReaderList>;

const error = (status: number, code: CardReaderErrorCode, message?: string, details?: CardReaderErrorBody["details"]) => ({
  status,
  body: { code, ...(message ? { message } : {}), ...(details ? { details } : {}) } satisfies CardReaderErrorBody,
});

/** Every Card Reader error in the contract, by name, for `mock*Response(status, body)`. */
export const cardReaderErrors = {
  stripeNotConfigured: error(503, "STRIPE_NOT_CONFIGURED"),
  validation: error(400, "VALIDATION"),
  payoutAccountNotReady: error(409, "PAYOUT_ACCOUNT_NOT_READY", "The Payout Account cannot take payments yet."),
  restaurantDetailsMissing: error(422, "RESTAURANT_DETAILS_MISSING"),
  codeInvalid: error(422, "CARD_READER_CODE_INVALID", "The registration code is invalid, expired or already used."),
  simulatedLiveMode: error(409, "SIMULATED_READER_LIVE_MODE", "Simulated readers exist only in test mode."),
  busy: error(409, "CARD_READER_BUSY", "The card reader is taking a payment.", { tableNumber: 4 }),
  providerError: error(502, "PAYMENT_PROVIDER_ERROR"),
  notFound: error(404, "NOT_FOUND"),
} satisfies Record<string, { status: number; body: CardReaderErrorBody }>;

/** The Simulated Reader when it is free to take a payment (the catalogue's one is busy with table 4). */
export const idleSimulatedReader: CardReader = { ...cardReaders.simulated, busyWith: null };

/** The unpaid bill as staff see it when the restaurant has `reader` and may take a card reader payment. */
export const cardReaderBill = (reader: CardReader = cardReaders.bar): SessionBill => ({
  ...unpaidBill,
  freeze: null,
  cardReader: { state: "OFFERED", reason: null, readers: [reader] },
  cardReaderPayment: null,
});

/** The attempt `POST /sessions/:id/card-reader-payment` answers with: the reader is asking for the card. */
export const cardReaderPaymentInProgress = (reader: CardReader = cardReaders.bar): CardReaderPayment => ({
  id: "card-reader-payment-1",
  sessionId: SESSION_ID,
  reader: { id: reader.id, name: reader.name, simulated: reader.simulated },
  amountCents: unpaidBill.totalCents,
  status: "IN_PROGRESS",
  failure: null,
  startedAt: "2026-11-22T19:00:00.000Z",
  expiresAt: "2026-11-22T19:05:00.000Z",
});

/** The same bill while `reader` takes its payment: frozen for the card reader. */
export const cardReaderPayingBill = (reader: CardReader = cardReaders.bar): SessionBill => ({
  ...cardReaderBill(reader),
  session: { ...unpaidBill.session, status: "paying" },
  canPayOnline: false,
  freeze: {
    kind: "CARD_READER",
    readerName: reader.name,
    totalCents: unpaidBill.totalCents,
    expiresAt: "2026-11-22T19:05:00.000Z",
  },
  cardReader: { state: "DISABLED", reason: "PAYMENT_IN_PROGRESS", readers: [reader] },
  cardReaderPayment: cardReaderPaymentInProgress(reader),
});

/** What a guest's table device reads while the bill is paid on a card reader (no staff fields). */
export const guestCardReaderPayingBill: SessionBill = {
  ...unpaidBill,
  session: { ...unpaidBill.session, status: "paying" },
  canPayOnline: false,
  freeze: {
    kind: "CARD_READER",
    readerName: cardReaders.bar.name,
    totalCents: unpaidBill.totalCents,
    expiresAt: "2026-11-22T19:05:00.000Z",
  },
};

/**
 * The bill after the card was declined or the reader failed (`bill.paymentFailed`, then `bill.unfrozen` FAILED):
 * open again, `reader` free, and the attempt kept as FAILED with its reason so staff can retry.
 */
export const cardReaderFailedBill = (
  failure: NonNullable<CardReaderPayment["failure"]> = {
    reason: "INSUFFICIENT_FUNDS",
    message: "The card was declined for insufficient funds.",
  },
  reader: CardReader = cardReaders.bar
): SessionBill => ({
  ...cardReaderBill(reader),
  cardReaderPayment: { ...cardReaderPaymentInProgress(reader), status: "FAILED", failure },
});

const paymentError = (status: number, code: PaymentErrorBody["code"], details?: Record<string, unknown>) => ({
  status,
  body: details ? { code, details } : { code },
});

/** The errors starting a card reader payment can answer with, by name, for `mock*Response(status, body)`. */
export const cardReaderPaymentErrors = {
  billPaid: paymentError(409, "BILL_PAID"),
  billEmpty: paymentError(422, "BILL_EMPTY"),
  billChanged: paymentError(409, "BILL_CHANGED", { totalCents: 2750 }),
  onlineInProgress: paymentError(409, "PAYMENT_IN_PROGRESS", { kind: "ONLINE", readerName: null }),
  readerInProgress: paymentError(409, "PAYMENT_IN_PROGRESS", { kind: "CARD_READER", readerName: "Terrasse" }),
  busy: paymentError(409, "CARD_READER_BUSY", { tableNumber: 7 }),
  offline: paymentError(409, "CARD_READER_OFFLINE"),
  payoutNotReady: paymentError(409, "CARD_READER_PAYMENT_UNAVAILABLE", { reason: "PAYOUT_ACCOUNT_NOT_READY" }),
  tseNotActive: paymentError(409, "CARD_READER_PAYMENT_UNAVAILABLE", { reason: "TSE_NOT_ACTIVE" }),
  providerError: paymentError(502, "PAYMENT_PROVIDER_ERROR"),
  stripeNotConfigured: paymentError(503, "STRIPE_NOT_CONFIGURED"),
} satisfies Record<string, { status: number; body: PaymentErrorBody }>;
