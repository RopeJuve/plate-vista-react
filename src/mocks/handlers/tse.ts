import { http, HttpResponse } from "msw";
import type { RetrySignatureResult } from "../../shared/api/payments";
import { activeTse, failedSignatures } from "../fixtures/tse";
import { apiPaths } from "./paths";

export const tseHandlers = [
  http.get(apiPaths.tse, () => HttpResponse.json(activeTse)),
  http.post(apiPaths.tseSetup, () => HttpResponse.json(activeTse)),
  http.get(apiPaths.tseFailed, () => HttpResponse.json({ items: failedSignatures })),
  http.post(apiPaths.tseRetry, () => HttpResponse.json<RetrySignatureResult>({ status: "SIGNED" })),
];
