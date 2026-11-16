import type {
  OnlinePaymentErrorCode,
  OnlinePaymentRefund,
  PaymentErrorBody,
  PayoutAccount,
} from "../../shared/api/payments";
import { SESSION_ID } from "./bill";

/** Every state of the owner's Payout Account, from never connected to ready. */
export const payoutAccounts = {
  notConnected: {
    connected: false,
    chargesEnabled: false,
    detailsSubmitted: false,
    onlinePaymentsEnabled: true,
  },
  /** Onboarding started, Stripe's form not finished. */
  onboardingUnfinished: {
    connected: true,
    chargesEnabled: false,
    detailsSubmitted: false,
    onlinePaymentsEnabled: true,
  },
  /** Form finished, Stripe still reviewing: no charges yet. */
  underReview: {
    connected: true,
    chargesEnabled: false,
    detailsSubmitted: true,
    onlinePaymentsEnabled: true,
  },
  ready: {
    connected: true,
    chargesEnabled: true,
    detailsSubmitted: true,
    onlinePaymentsEnabled: true,
  },
  readySwitchedOff: {
    connected: true,
    chargesEnabled: true,
    detailsSubmitted: true,
    onlinePaymentsEnabled: false,
  },
} satisfies Record<string, PayoutAccount>;

/** One Late Payment refund for each reason, newest first. */
export const lateRefunds: OnlinePaymentRefund[] = [
  {
    id: "refund-3",
    sessionId: "session-closed",
    tableNumber: 2,
    amountCents: 3120,
    reason: "SESSION_CLOSED",
    refundedAt: "2026-11-07T22:10:00.000Z",
  },
  {
    id: "refund-2",
    sessionId: "session-unfrozen",
    tableNumber: 7,
    amountCents: 1890,
    reason: "BILL_NOT_FROZEN",
    refundedAt: "2026-11-07T21:02:00.000Z",
  },
  {
    id: "refund-1",
    sessionId: SESSION_ID,
    tableNumber: 4,
    amountCents: 2050,
    reason: "BILL_ALREADY_PAID",
    refundedAt: "2026-11-07T19:41:00.000Z",
  },
];

const error = (status: number, code: OnlinePaymentErrorCode) => ({
  status,
  body: { code },
});

/** Every online payment error in the contract, by name, for `mock*Response(status, body)`. */
export const onlinePaymentErrors = {
  stripeNotConfigured: error(503, "STRIPE_NOT_CONFIGURED"),
  unavailable: error(409, "ONLINE_PAYMENT_UNAVAILABLE"),
  providerError: error(502, "PAYMENT_PROVIDER_ERROR"),
  billFrozen: error(409, "BILL_FROZEN"),
  billPayingOnline: error(409, "BILL_PAYING_ONLINE"),
} satisfies Record<string, { status: number; body: PaymentErrorBody }>;
