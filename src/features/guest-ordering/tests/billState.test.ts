import { describe, expect, it } from "vitest";
import { applyBillEvent, emptyBill, markBillPaid, payableCents, payableOrders, withServerPayment } from "../billState";

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
