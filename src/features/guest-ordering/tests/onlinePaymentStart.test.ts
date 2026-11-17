import { describe, expect, it } from "vitest";
import { onlinePaymentStartProblem } from "../onlinePaymentStart";

const answered = (status: number, code?: string) => ({ response: { status, data: code ? { code } : {} } });

describe("onlinePaymentStartProblem", () => {
  it("says the bill can't be paid online now, and has it re-read, on 409 ONLINE_PAYMENT_UNAVAILABLE", () => {
    const problem = onlinePaymentStartProblem(answered(409, "ONLINE_PAYMENT_UNAVAILABLE"));
    expect(problem.message).toMatch(/^Online payment isn't available for this bill right now\./);
    expect(problem.unavailable).toBe(true);
  });

  it("sends the guest to the staff and keeps the button on 502 PAYMENT_PROVIDER_ERROR", () => {
    expect(onlinePaymentStartProblem(answered(502, "PAYMENT_PROVIDER_ERROR"))).toEqual({
      message: "Online payment isn't available right now, please ask the staff.",
      unavailable: false,
    });
  });

  it("re-reads the bill when it was frozen or paid meanwhile", () => {
    expect(onlinePaymentStartProblem(answered(409, "BILL_PAID")).unavailable).toBe(true);
  });

  it("falls back to the staff message for anything else, never 'checkout'", () => {
    for (const error of [new Error("Network Error"), answered(500), answered(503, "STRIPE_NOT_CONFIGURED")]) {
      const problem = onlinePaymentStartProblem(error);
      expect(problem.unavailable).toBe(false);
      expect(problem.message).toMatch(/online payment/i);
      expect(problem.message).not.toMatch(/checkout/i);
    }
  });
});
