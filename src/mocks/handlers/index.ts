import { categoryHandlers } from "./categories";
import { legalHandlers } from "./legal";
import { paymentHandlers } from "./payments";
import { receiptHandlers } from "./receipts";
import { tseHandlers } from "./tse";

/** Default handlers for every endpoint in the payments contract (plate-vista-api#20). */
export const handlers = [
  ...categoryHandlers,
  ...legalHandlers,
  ...tseHandlers,
  ...paymentHandlers,
  ...receiptHandlers,
];
