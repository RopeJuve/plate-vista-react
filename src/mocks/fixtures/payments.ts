import type { Payment, PaymentErrorBody } from "../../shared/api/payments";
import type { SessionBill } from "../../shared/realtime/protocol";
import { SESSION_ID, unpaidBill } from "./bill";

export const payment: Payment = {
  id: "payment-1",
  sessionId: SESSION_ID,
  method: "CARD_TERMINAL",
  amountCents: unpaidBill.totalCents,
  paidAt: "2026-11-07T19:30:00.000Z",
  receiptToken: "receipt-token-1",
  signature: { status: "PENDING" },
};

export const paidBill: SessionBill = { ...unpaidBill, payment };

/** Every `POST /sessions/:id/payments` answer in the contract, by name. */
export const payResponses = {
  created: { status: 201, body: payment },
  replay: { status: 200, body: payment },
  billPaid: { status: 409, body: { code: "BILL_PAID" } },
  billChanged: { status: 409, body: { code: "BILL_CHANGED", totalCents: 2800 } },
  tseNotActive: { status: 412, body: { code: "TSE_NOT_ACTIVE" } },
  billEmpty: { status: 422, body: { code: "BILL_EMPTY" } },
} satisfies Record<string, { status: number; body: Payment | PaymentErrorBody }>;

export const closeUnpaidError: PaymentErrorBody = { code: "BILL_UNPAID" };
