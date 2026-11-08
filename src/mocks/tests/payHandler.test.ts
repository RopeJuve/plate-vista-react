// @vitest-environment jsdom
import { isAxiosError } from "axios";
import { describe, expect, it } from "vitest";
import api from "../../shared/api/client";
import type { PayBillBody, Payment, PaymentErrorBody } from "../../shared/api/payments";
import { payResponses } from "../fixtures/payments";
import { mockPayResponse } from "../overrides";

const body: PayBillBody = { method: "CASH", clientPaymentId: "client-payment-1", expectedTotalCents: 2050 };

const pay = () => api.post<Payment>("/sessions/session-1/payments", body, { skipErrorToast: true });

const errorOf = async (request: Promise<unknown>) => {
  const error = await request.catch((caught: unknown) => caught);
  if (!isAxiosError<PaymentErrorBody>(error)) throw new Error("expected the request to fail");
  return { status: error.response?.status, body: error.response?.data };
};

describe("pay handler", () => {
  it("creates the payment by default (201)", async () => {
    const response = await pay();

    expect(response.status).toBe(201);
    expect(response.data).toMatchObject({ sessionId: "session-1", method: "CASH", amountCents: 2050 });
  });

  it("answers 409 BILL_PAID when a test overrides it", async () => {
    mockPayResponse(409, { code: "BILL_PAID" });

    await expect(errorOf(pay())).resolves.toEqual({ status: 409, body: { code: "BILL_PAID" } });
  });

  it("serves the contract fixtures, e.g. 409 BILL_CHANGED with the new total", async () => {
    mockPayResponse(payResponses.billChanged.status, payResponses.billChanged.body);

    await expect(errorOf(pay())).resolves.toEqual({
      status: 409,
      body: { code: "BILL_CHANGED", totalCents: 2800 },
    });
  });

  it("goes back to 201 in the next test", async () => {
    await expect(pay()).resolves.toMatchObject({ status: 201 });
  });
});
