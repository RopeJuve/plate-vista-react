import { describe, expect, it } from "vitest";
import { onlinePaymentErrors, payoutAccounts } from "../../../mocks/fixtures/onlinePayments";
import { payoutAccountStage, payoutProblem, payoutReturn } from "../payoutAccountStage";

const answered = (status: number, body?: unknown) => ({ response: { status, data: body } });

describe("payoutAccountStage", () => {
  it.each([
    ["notConnected", "NOT_CONNECTED"],
    ["onboardingUnfinished", "UNFINISHED"],
    ["underReview", "UNDER_REVIEW"],
    ["ready", "READY"],
    ["readySwitchedOff", "READY"],
  ] as const)("%s is %s", (fixture, stage) => {
    expect(payoutAccountStage(payoutAccounts[fixture])).toBe(stage);
  });
});

describe("payoutProblem", () => {
  it("is NOT_CONFIGURED for a 503 STRIPE_NOT_CONFIGURED", () => {
    const { status, body } = onlinePaymentErrors.stripeNotConfigured;
    expect(payoutProblem(answered(status, body))).toBe("NOT_CONFIGURED");
  });

  it.each([
    ["a 502", answered(502, onlinePaymentErrors.providerError.body)],
    ["a 503 without the code", answered(503)],
    ["a dropped connection", new Error("Network Error")],
  ])("is FAILED for %s", (_, error) => {
    expect(payoutProblem(error)).toBe("FAILED");
  });
});

describe("payoutReturn", () => {
  it.each([
    ["?payout=return", "RETURN"],
    ["?payout=refresh", "REFRESH"],
    ["?payout=other", null],
    ["", null],
  ])("%s is %s", (search, expected) => {
    expect(payoutReturn(new URLSearchParams(search))).toBe(expected);
  });
});
