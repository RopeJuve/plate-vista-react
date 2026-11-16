import { describe, expect, it } from "vitest";
import type { OnlinePaymentErrorCode } from "../../api/payments";
import { errorMessage, requestErrorMessage } from "../errorMessages";
import { ProtocolError } from "../protocol";

const ONLINE_PAYMENT_CODES: OnlinePaymentErrorCode[] = [
  "ONLINE_PAYMENT_UNAVAILABLE",
  "PAYMENT_PROVIDER_ERROR",
  "BILL_FROZEN",
  "BILL_PAYING_ONLINE",
  "STRIPE_NOT_CONFIGURED",
];

describe("errorMessage for online payments", () => {
  it.each(ONLINE_PAYMENT_CODES)("has its own text for %s, never the generic one", (code) => {
    const text = errorMessage(code, undefined, "fallback");
    expect(text).not.toBe("fallback");
    expect(text).not.toMatch(/something went wrong/i);
  });

  it("says online payment, never checkout", () => {
    for (const code of ONLINE_PAYMENT_CODES) {
      expect(errorMessage(code)).not.toMatch(/checkout/i);
    }
    expect(errorMessage("ONLINE_PAYMENT_UNAVAILABLE")).toMatch(/online payment/i);
  });

  it("explains a BILL_FROZEN ack from the socket", () => {
    const error = new ProtocolError("BILL_FROZEN", "Bill is frozen");
    expect(requestErrorMessage(error, "fallback")).toMatch(/paying online/i);
  });
});
