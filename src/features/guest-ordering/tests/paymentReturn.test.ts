import { describe, expect, it } from "vitest";
import { cancelPaymentProblem, paymentArrival, withoutPaymentParam } from "../paymentReturn";

describe("paymentArrival", () => {
  it("reads the guest coming back from Stripe after paying or going back", () => {
    expect(paymentArrival(new URLSearchParams("payment=return"))).toBe("RETURN");
    expect(paymentArrival(new URLSearchParams("payment=cancelled"))).toBe("CANCELLED");
  });

  it("ignores a missing or unknown value", () => {
    expect(paymentArrival(new URLSearchParams(""))).toBeNull();
    expect(paymentArrival(new URLSearchParams("payment=paid"))).toBeNull();
  });
});

describe("withoutPaymentParam", () => {
  it("drops only the payment parameter", () => {
    expect(withoutPaymentParam(new URLSearchParams("payment=return&lang=en")).toString()).toBe("lang=en");
  });
});

describe("cancelPaymentProblem", () => {
  const answer = (status: number, code?: string) => ({ response: { status, data: { code } } });

  it("sees a payment already going through in another tab", () => {
    expect(cancelPaymentProblem(answer(409, "BILL_PAYING_ONLINE"))).toBe("PAYING_ONLINE");
  });

  it("leaves everything else, a lost connection included, to the page as it is", () => {
    expect(cancelPaymentProblem(answer(409, "BILL_PAID"))).toBe("OTHER");
    expect(cancelPaymentProblem(answer(500))).toBe("OTHER");
    expect(cancelPaymentProblem(new Error("Network Error"))).toBe("OTHER");
  });
});
