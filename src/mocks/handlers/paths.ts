/**
 * Every mocked endpoint, as an msw path. The leading `*` matches any origin and
 * the `/api/v1` prefix, so the same handlers serve tests and `VITE_USE_MOCKS` dev runs.
 */
export const apiPaths = {
  categories: "*/categories",
  category: "*/categories/:id",
  legal: "*/restaurant/legal",
  profile: "*/restaurant/profile",
  publicProfile: "*/r/:slug/profile",
  tse: "*/tse",
  tseSetup: "*/tse/setup",
  tseFailed: "*/tse/failed",
  tseRetry: "*/tse/failed/:kind/:id/retry",
  pay: "*/sessions/:sessionId/payments",
  bill: "*/sessions/:sessionId/bill",
  close: "*/sessions/:sessionId/close",
  receipt: "*/receipts/:token",
  staffBoard: "*/staff/board",
  payoutAccount: "*/restaurant/payout-account",
  onlinePaymentRefunds: "*/restaurant/online-payment-refunds",
  onlinePayment: "*/sessions/:sessionId/online-payment",
  cancelOnlinePayment: "*/sessions/:sessionId/online-payment/cancel",
  receiptToken: "*/sessions/:sessionId/receipt-token",
  cardReaderPayment: "*/sessions/:sessionId/card-reader-payment",
  cardReaderTestCard: "*/sessions/:sessionId/card-reader-payment/test-card",
  cancelCardReaderPayment: "*/sessions/:sessionId/card-reader-payment/cancel",
  retryCardReaderPayment: "*/sessions/:sessionId/card-reader-payment/retry",
  cardReaders: "*/restaurant/card-readers",
  simulatedCardReader: "*/restaurant/card-readers/simulated",
  cardReader: "*/restaurant/card-readers/:id",
} as const;

export type ApiPath = keyof typeof apiPaths;
