import { describe, expect, it } from "vitest";
import { frozenBill } from "../fixtures/bill";
import { lateRefunds, onlinePaymentErrors, payoutAccounts } from "../fixtures/onlinePayments";
import { paidBill } from "../fixtures/payments";
import {
  mockBillResponse,
  mockCancelOnlinePaymentResponse,
  mockOnlinePaymentRefundsResponse,
  mockPayoutAccountResponse,
  mockPayoutOnboardingResponse,
  mockOnlinePaymentsSwitchResponse,
  mockStartOnlinePaymentResponse,
} from "../overrides";

const API = "http://localhost/api/v1";

const call = async (path: string, init?: RequestInit) => {
  const response = await fetch(`${API}${path}`, init);
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
};

const send = (method: string, path: string, body?: unknown) =>
  call(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("online payment handlers", () => {
  it("serves a bill the guest may pay online by default", async () => {
    expect((await call("/sessions/session-1/bill")).body.canPayOnline).toBe(true);
  });

  it("lets a test serve a frozen bill or a paid one, neither payable online", async () => {
    mockBillResponse(200, frozenBill);
    expect((await call("/sessions/session-1/bill")).body).toMatchObject({
      session: { status: "paying" },
      canPayOnline: false,
    });

    mockBillResponse(200, paidBill);
    expect((await call("/sessions/session-1/bill")).body.canPayOnline).toBe(false);
  });

  it("lets a test switch the Payout Account through every state", async () => {
    for (const account of Object.values(payoutAccounts)) {
      mockPayoutAccountResponse(200, account);
      expect((await call("/restaurant/payout-account")).body).toEqual(account);
    }
    expect(payoutAccounts.underReview).toMatchObject({
      detailsSubmitted: true,
      chargesEnabled: false,
    });
  });

  it("refuses a switch without a boolean", async () => {
    expect((await send("PATCH", "/restaurant/payout-account", {})).status).toBe(400);
  });

  it("lists one Late Payment refund for each reason", async () => {
    const { body } = await call("/restaurant/online-payment-refunds");
    expect(new Set(body.items.map((refund: { reason: string }) => refund.reason))).toEqual(
      new Set(["BILL_ALREADY_PAID", "BILL_NOT_FROZEN", "SESSION_CLOSED"])
    );
    expect(body.items).toEqual(lateRefunds);
  });

  it("cancels an online payment with 200", async () => {
    expect((await send("POST", "/sessions/session-1/online-payment/cancel")).status).toBe(200);
  });

  it("lets a test switch on every online payment error", async () => {
    const { stripeNotConfigured, unavailable, providerError, billPayingOnline } = onlinePaymentErrors;

    mockStartOnlinePaymentResponse(unavailable.status, unavailable.body);
    expect(await send("POST", "/sessions/session-1/online-payment")).toEqual({
      status: 409,
      body: { code: "ONLINE_PAYMENT_UNAVAILABLE" },
    });

    mockStartOnlinePaymentResponse(providerError.status, providerError.body);
    expect((await send("POST", "/sessions/session-1/online-payment")).status).toBe(502);

    mockCancelOnlinePaymentResponse(billPayingOnline.status, billPayingOnline.body);
    expect(await send("POST", "/sessions/session-1/online-payment/cancel")).toEqual({
      status: 409,
      body: { code: "BILL_PAYING_ONLINE" },
    });

    mockPayoutOnboardingResponse(stripeNotConfigured.status, stripeNotConfigured.body);
    mockOnlinePaymentsSwitchResponse(stripeNotConfigured.status, stripeNotConfigured.body);
    mockOnlinePaymentRefundsResponse(stripeNotConfigured.status, stripeNotConfigured.body);
    expect((await send("POST", "/restaurant/payout-account")).status).toBe(503);
    expect(
      (
        await send("PATCH", "/restaurant/payout-account", {
          onlinePaymentsEnabled: true,
        })
      ).status
    ).toBe(503);
    expect((await call("/restaurant/online-payment-refunds")).body).toEqual({
      code: "STRIPE_NOT_CONFIGURED",
    });
  });

  it("has a BILL_FROZEN answer for a frozen bill", () => {
    expect(onlinePaymentErrors.billFrozen).toEqual({
      status: 409,
      body: { code: "BILL_FROZEN" },
    });
  });
});
