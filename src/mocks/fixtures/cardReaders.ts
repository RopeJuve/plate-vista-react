import type { CardReader, CardReaderPayment, PaymentErrorBody } from "../../shared/api/payments";
import type { SessionBill } from "../../shared/realtime/protocol";
import { SESSION_ID, unpaidBill } from "./bill";

/** A real reader at the bar and a Simulated Reader, both online and free. */
export const cardReaders = {
  bar: {
    id: "reader-bar",
    name: "Bar",
    deviceType: "stripe_s700",
    serialNumber: "STRM26138003393",
    status: "online",
    simulated: false,
    busyWith: null,
    addedAt: "2026-11-20T09:12:00.000Z",
  },
  simulated: {
    id: "reader-test",
    name: "Test reader",
    deviceType: "simulated_wisepos_e",
    serialNumber: "SIMULATED-1",
    status: "online",
    simulated: true,
    busyWith: null,
    addedAt: "2026-11-21T14:00:00.000Z",
  },
} satisfies Record<string, CardReader>;

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

const error = (status: number, code: PaymentErrorBody["code"], details?: Record<string, unknown>) => ({
  status,
  body: details ? { code, details } : { code },
});

/** The errors starting a card reader payment can answer with, by name, for `mock*Response(status, body)`. */
export const cardReaderErrors = {
  billPaid: error(409, "BILL_PAID"),
  billEmpty: error(422, "BILL_EMPTY"),
  billChanged: error(409, "BILL_CHANGED", { totalCents: 2750 }),
  onlineInProgress: error(409, "PAYMENT_IN_PROGRESS", { kind: "ONLINE", readerName: null }),
  readerInProgress: error(409, "PAYMENT_IN_PROGRESS", { kind: "CARD_READER", readerName: "Terrasse" }),
  busy: error(409, "CARD_READER_BUSY", { tableNumber: 7 }),
  offline: error(409, "CARD_READER_OFFLINE"),
  payoutNotReady: error(409, "CARD_READER_PAYMENT_UNAVAILABLE", { reason: "PAYOUT_ACCOUNT_NOT_READY" }),
  tseNotActive: error(409, "CARD_READER_PAYMENT_UNAVAILABLE", { reason: "TSE_NOT_ACTIVE" }),
  providerError: error(502, "PAYMENT_PROVIDER_ERROR"),
  stripeNotConfigured: error(503, "STRIPE_NOT_CONFIGURED"),
} satisfies Record<string, { status: number; body: PaymentErrorBody }>;
