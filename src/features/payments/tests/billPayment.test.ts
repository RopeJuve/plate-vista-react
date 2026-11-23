import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { paidBill } from "../../../mocks/fixtures/payments";
import { frozenBill, unpaidBill } from "../../../mocks/fixtures/bill";
import {
  billPayingOnline,
  canPayBill,
  canRetryPayment,
  isGuestPayingOnline,
  methodLabel,
  payProblem,
  receiptPath,
  receiptUrl,
  reloadsBill,
} from "../billPayment";

const answer = (status: number, data: unknown) =>
  new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "",
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe("canPayBill", () => {
  it("offers to pay an unpaid bill above zero", () => {
    expect(canPayBill(unpaidBill)).toBe(true);
  });

  it("does not offer to pay a paid bill or an empty one", () => {
    expect(canPayBill(paidBill)).toBe(false);
    expect(canPayBill({ ...unpaidBill, totalCents: 0 })).toBe(false);
  });
});

describe("methodLabel", () => {
  it("names cash and card the way staff say it", () => {
    expect(methodLabel("CASH")).toBe("Cash");
    expect(methodLabel("CARD_TERMINAL")).toBe("Card");
  });

  it("counts a card reader payment as Card, like the Card Terminal", () => {
    expect(methodLabel("CARD_READER")).toBe("Card");
  });

  it("labels a guest's online payment Online", () => {
    expect(methodLabel("ONLINE")).toBe("Online");
  });
});

describe("a frozen bill", () => {
  it("is paying online while its session is paying and nothing was recorded", () => {
    expect(isGuestPayingOnline(frozenBill)).toBe(true);
    expect(isGuestPayingOnline(unpaidBill)).toBe(false);
    expect(isGuestPayingOnline({ ...frozenBill, payment: paidBill.payment })).toBe(false);
  });

  it("can still be paid in cash or by card: staff always win", () => {
    expect(canPayBill(frozenBill)).toBe(true);
  });

  it("knows the 409 BILL_PAYING_ONLINE answer: the guest's online payment got there first", () => {
    expect(billPayingOnline(answer(409, { code: "BILL_PAYING_ONLINE" }))).toBe(true);
    expect(billPayingOnline(answer(409, { code: "BILL_PAID" }))).toBe(false);
    expect(billPayingOnline(new Error("boom"))).toBe(false);
  });
});

describe("payProblem", () => {
  it("reads 409 BILL_CHANGED with the server's new total", () => {
    expect(payProblem(answer(409, { code: "BILL_CHANGED", totalCents: 2800 }))).toEqual({
      kind: "BILL_CHANGED",
      totalCents: 2800,
    });
  });

  it("reads 409 BILL_PAID, 412 TSE_NOT_ACTIVE and 422 BILL_EMPTY", () => {
    expect(payProblem(answer(409, { code: "BILL_PAID" }))).toEqual({ kind: "BILL_PAID" });
    expect(payProblem(answer(412, { code: "TSE_NOT_ACTIVE" }))).toEqual({ kind: "TSE_NOT_ACTIVE" });
    expect(payProblem(answer(422, { code: "BILL_EMPTY" }))).toEqual({ kind: "BILL_EMPTY" });
  });

  it("reads 409 BILL_PAYING_ONLINE as paid online, which is never retried", () => {
    const problem = payProblem(answer(409, { code: "BILL_PAYING_ONLINE" }));
    expect(problem).toEqual({ kind: "BILL_PAYING_ONLINE" });
    expect(canRetryPayment(problem)).toBe(false);
  });

  it("treats a request that got no answer as a network error, which is safe to retry", () => {
    expect(payProblem(new AxiosError("Network Error", "ERR_NETWORK"))).toEqual({ kind: "NETWORK" });
    expect(payProblem(new Error("boom"))).toEqual({ kind: "NETWORK" });
  });

  it("treats any other answer as a failure", () => {
    expect(payProblem(answer(500, { code: "INTERNAL" }))).toEqual({ kind: "FAILED" });
  });
});

describe("what a problem leads to", () => {
  it("lets staff confirm again with the same id only when the outcome is unknown", () => {
    expect(canRetryPayment({ kind: "NETWORK" })).toBe(true);
    expect(canRetryPayment({ kind: "FAILED" })).toBe(true);
    expect(canRetryPayment({ kind: "BILL_CHANGED", totalCents: 2800 })).toBe(false);
    expect(canRetryPayment({ kind: "TSE_NOT_ACTIVE" })).toBe(false);
  });

  it("reloads the bill when it changed or was paid elsewhere", () => {
    expect(reloadsBill({ kind: "BILL_CHANGED" })).toBe(true);
    expect(reloadsBill({ kind: "BILL_PAID" })).toBe(true);
    expect(reloadsBill({ kind: "BILL_PAYING_ONLINE" })).toBe(true);
    expect(reloadsBill({ kind: "BILL_EMPTY" })).toBe(false);
    expect(reloadsBill({ kind: "NETWORK" })).toBe(false);
  });
});

describe("receipt links", () => {
  it("builds the receipt path and the full URL the QR code opens", () => {
    expect(receiptPath("abc 1")).toBe("/receipt/abc%201");
    expect(receiptUrl("https://plate.example", "tok")).toBe("https://plate.example/receipt/tok");
  });
});
