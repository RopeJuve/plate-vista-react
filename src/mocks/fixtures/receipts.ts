import type { Receipt, SignatureStatus } from "../../shared/api/payments";
import { completeLegalDetails } from "./legal";

export const SIGNED_RECEIPT_TOKEN = "receipt-token-1";
export const PENDING_RECEIPT_TOKEN = "receipt-token-pending";
export const FAILED_RECEIPT_TOKEN = "receipt-token-failed";
export const MISSING_RECEIPT_TOKEN = "receipt-token-missing";

const receiptWith = (signature: Receipt["signature"]): Receipt => ({
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

/** Receipts the default handler serves, by token. Any other token answers 404. */
export const receiptsByToken: Record<string, Receipt> = {
  [SIGNED_RECEIPT_TOKEN]: signedReceipt,
  [PENDING_RECEIPT_TOKEN]: pendingReceipt,
  [FAILED_RECEIPT_TOKEN]: failedReceipt,
};
