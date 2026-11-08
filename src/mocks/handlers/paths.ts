/**
 * Every mocked endpoint, as an msw path. The leading `*` matches any origin and
 * the `/api/v1` prefix, so the same handlers serve tests and `VITE_USE_MOCKS` dev runs.
 */
export const apiPaths = {
  categories: "*/categories",
  category: "*/categories/:id",
  legal: "*/restaurant/legal",
  tse: "*/tse",
  tseSetup: "*/tse/setup",
  tseFailed: "*/tse/failed",
  tseRetry: "*/tse/failed/:kind/:id/retry",
  pay: "*/sessions/:sessionId/payments",
  bill: "*/sessions/:sessionId/bill",
  close: "*/sessions/:sessionId/close",
  receipt: "*/receipts/:token",
} as const;

export type ApiPath = keyof typeof apiPaths;
