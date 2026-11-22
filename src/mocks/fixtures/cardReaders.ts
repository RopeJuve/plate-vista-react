import type { CardReader, CardReaderErrorBody, CardReaderErrorCode, CardReaderList } from "../../shared/api/payments";

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
