import type { Receipt, SignatureStatus } from "../../shared/api/payments";
import { completeLegalDetails } from "./legal";

export const SIGNED_RECEIPT_TOKEN = "receipt-token-1";
export const PENDING_RECEIPT_TOKEN = "receipt-token-pending";
export const FAILED_RECEIPT_TOKEN = "receipt-token-failed";
export const ONLINE_RECEIPT_TOKEN = "receipt-token-online";
export const PAYPAL_RECEIPT_TOKEN = "receipt-token-paypal";
export const MISSING_RECEIPT_TOKEN = "receipt-token-missing";

const receiptWith = (signature: Receipt["signature"]): Receipt => ({
  receiptNumber: signature.status === "SIGNED" ? signature.txNumber ?? null : null,
  tableNumber: 12,
  servicePeriod: { start: "2026-11-07T18:05:12.000Z", end: "2026-11-07T19:30:00.000Z" },
  restaurant: {
    name: "Plate Vista",
    legalName: completeLegalDetails.legalName,
    address: completeLegalDetails.address,
    taxNumber: completeLegalDetails.taxNumber,
    vatId: completeLegalDetails.vatId,
  },
  lines: [
    { title: "Tomato soup", quantity: 2, unitPriceCents: 650, lineTotalCents: 1300, vatRate: "REDUCED_1" },
    { title: "House red", quantity: 1, unitPriceCents: 750, lineTotalCents: 750, vatRate: "NORMAL" },
  ],
  totalsByVat: [
    { vatRate: "REDUCED_1", netCents: 1215, vatCents: 85, grossCents: 1300 },
    { vatRate: "NORMAL", netCents: 630, vatCents: 120, grossCents: 750 },
  ],
  totalCents: 2050,
  method: "CARD_TERMINAL",
  paidAt: "2026-11-07T19:30:00.000Z",
  signature,
});

const unsigned = (status: Exclude<SignatureStatus, "SIGNED">) => receiptWith({ status });

export const signedReceipt = receiptWith({
  status: "SIGNED",
  txNumber: 1042,
  timeStart: "2026-11-07T19:30:00.000Z",
  timeEnd: "2026-11-07T19:30:01.000Z",
  value: "MEUCIQDexampleSignatureValue==",
  counter: 2084,
  tssSerial: "tss-serial-0001",
  clientSerial: "client-0001",
  qrCodeData: "V0;client-0001;Kassenbeleg-V1;Beleg^20.50_0.00_0.00_0.00_0.00^20.50:Unbar;1042;2084;2026-11-07T19:30:00.000Z;2026-11-07T19:30:01.000Z;ecdsa-plain-SHA384;unixTime;MEUCIQDexampleSignatureValue==;BHhLZXk=",
});

export const pendingReceipt = unsigned("PENDING");
export const failedReceipt = unsigned("FAILED");

/** Paid online by card through Apple Pay. */
export const onlineReceipt: Receipt = {
  ...signedReceipt,
  method: "ONLINE",
  paymentDetails: {
    type: "card",
    brand: "visa",
    last4: "4242",
    funding: "debit",
    wallet: "apple_pay",
    authorizationCode: "831000",
    transactionId: "pi_3QxExample0001",
    authorizedAt: "2026-11-07T19:29:58.000Z",
  },
};

/** Paid online with PayPal: no card fields. */
export const paypalReceipt: Receipt = {
  ...signedReceipt,
  method: "ONLINE",
  paymentDetails: { type: "paypal", transactionId: "pi_3QxExample0002", authorizedAt: "2026-11-07T19:29:58.000Z" },
};

/** Receipts the default handler serves, by token. Any other token answers 404. */
export const receiptsByToken: Record<string, Receipt> = {
  [SIGNED_RECEIPT_TOKEN]: signedReceipt,
  [PENDING_RECEIPT_TOKEN]: pendingReceipt,
  [FAILED_RECEIPT_TOKEN]: failedReceipt,
  [ONLINE_RECEIPT_TOKEN]: onlineReceipt,
  [PAYPAL_RECEIPT_TOKEN]: paypalReceipt,
};
