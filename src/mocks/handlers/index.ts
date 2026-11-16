import { categoryHandlers } from "./categories";
import { legalHandlers } from "./legal";
import { onlinePaymentHandlers } from "./onlinePayments";
import { profileHandlers } from "./profile";
import { paymentHandlers } from "./payments";
import { receiptHandlers } from "./receipts";
import { staffBoardHandlers } from "./staffBoard";
import { tseHandlers } from "./tse";

/** Default handlers for every endpoint in the payments contract (plate-vista-api#20). */
export const handlers = [
  ...categoryHandlers,
  ...legalHandlers,
  ...profileHandlers,
  ...tseHandlers,
  ...paymentHandlers,
  ...receiptHandlers,
  ...staffBoardHandlers,
  ...onlinePaymentHandlers,
];
