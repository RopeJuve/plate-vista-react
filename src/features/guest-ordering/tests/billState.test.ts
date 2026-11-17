// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  applyBillEvent,
  emptyBill,
  loadBill,
  markBillFrozen,
  markBillPaid,
  payableCents,
  payableOrders,
  saveBill,
  withServerBill,
  withServerPayment,
} from "../billState";

const soup = { status: "served" as const, totalCents: 900 };
const cola = { status: "pending" as const, totalCents: 300 };
const wine = { status: "cancelled" as const, totalCents: 1200 };

describe("bill totals", () => {
  it("leaves cancelled orders off what the guest pays", () => {
    expect(payableOrders([soup, wine, cola])).toEqual([soup, cola]);
    expect(payableCents([soup, wine, cola])).toBe(1200);
  });

  it("owes nothing on an empty bill", () => {
    expect(payableCents([])).toBe(0);
  });
});

describe("a paid bill", () => {
  const paidEvent = {
    event: "bill.paid" as const,
    data: { sessionId: "session-1", paymentId: "payment-1", receiptToken: "receipt-1", method: "CASH" as const, totalCents: 1200 },
  };

  it("is paid once bill.paid arrives for the guest's own session, with its receipt", () => {
    expect(applyBillEvent(emptyBill(), paidEvent, "session-1").paid).toEqual({ receiptToken: "receipt-1" });
  });

  it("ignores bill.paid for another session", () => {
    expect(applyBillEvent(emptyBill(), paidEvent, "session-2").paid).toBeNull();
  });

  it("takes the payment from the server's bill, and keeps a known payment when the bill has none", () => {
    const paid = withServerPayment(emptyBill(), { receiptToken: "receipt-1" });
    expect(paid.paid).toEqual({ receiptToken: "receipt-1" });
    expect(withServerPayment(paid, null).paid).toEqual({ receiptToken: "receipt-1" });
  });

  it("is paid without a receipt when an order is refused as already paid", () => {
    expect(markBillPaid(emptyBill()).paid).toEqual({ receiptToken: null });
    const known = markBillPaid(withServerPayment(emptyBill(), { receiptToken: "receipt-1" }));
    expect(known.paid).toEqual({ receiptToken: "receipt-1" });
  });
});

describe("a frozen bill (protocol 2.5)", () => {
  const expiresAt = "2026-11-07T20:00:00.000Z";
  const frozenEvent = (sessionId: string) => ({ event: "bill.frozen" as const, data: { sessionId, expiresAt } });
  const unfrozenEvent = (sessionId: string) => ({ event: "bill.unfrozen" as const, data: { sessionId } });
  const serverBill = (status: "open" | "paying", canPayOnline: boolean) => ({
    payment: null,
    session: { status },
    canPayOnline,
    totalCents: 2050,
  });

  it("starts neither frozen nor payable online until the server says so", () => {
    expect(emptyBill()).toMatchObject({ frozen: false, payOnline: null });
  });

  it("is payable online with the server's total when the bill allows it", () => {
    expect(withServerBill(emptyBill(), serverBill("open", true))).toMatchObject({
      frozen: false,
      payOnline: { totalCents: 2050 },
    });
    expect(withServerBill(emptyBill(), serverBill("open", false)).payOnline).toBeNull();
  });

  it("is frozen when the server's session is paying, and not payable online again", () => {
    expect(withServerBill(emptyBill(), serverBill("paying", false))).toMatchObject({ frozen: true, payOnline: null });
  });

  it("thaws when the server's session is open again", () => {
    const frozen = withServerBill(emptyBill(), serverBill("paying", false));
    expect(withServerBill(frozen, serverBill("open", true))).toMatchObject({ frozen: false, payOnline: { totalCents: 2050 } });
  });

  it("takes the payment from the server's bill too", () => {
    const paid = withServerBill(emptyBill(), { ...serverBill("open", false), payment: { receiptToken: "receipt-1" } });
    expect(paid.paid).toEqual({ receiptToken: "receipt-1" });
  });

  it("freezes on bill.frozen for the guest's own session and hides paying online", () => {
    const payable = withServerBill(emptyBill(), serverBill("open", true));
    expect(applyBillEvent(payable, frozenEvent("session-1"), "session-1")).toMatchObject({ frozen: true, payOnline: null });
  });

  it("thaws on bill.unfrozen for the guest's own session", () => {
    const frozen = markBillFrozen(emptyBill());
    expect(applyBillEvent(frozen, unfrozenEvent("session-1"), "session-1").frozen).toBe(false);
  });

  it("ignores bill.frozen and bill.unfrozen for another session", () => {
    const payable = withServerBill(emptyBill(), serverBill("open", true));
    expect(applyBillEvent(payable, frozenEvent("session-2"), "session-1")).toBe(payable);
    const frozen = markBillFrozen(emptyBill());
    expect(applyBillEvent(frozen, unfrozenEvent("session-2"), "session-1")).toBe(frozen);
  });

  it("is frozen when an order is refused with BILL_FROZEN", () => {
    const payable = withServerBill(emptyBill(), serverBill("open", true));
    expect(markBillFrozen(payable)).toMatchObject({ frozen: true, payOnline: null });
  });

  it("never comes back frozen from storage: the server decides on load", () => {
    saveBill("session-1", markBillFrozen(emptyBill()));
    expect(loadBill("session-1")).toMatchObject({ frozen: false, payOnline: null });
  });
});
