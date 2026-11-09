import { describe, expect, it } from "vitest";
import { unpaidBill } from "../../../mocks/fixtures/bill";
import { paidBill } from "../../../mocks/fixtures/payments";
import { canCloseUnpaid, closeBlock, closeResult } from "../closeTable";

describe("closing a table", () => {
  it("blocks an unpaid bill with something on it", () => {
    expect(closeBlock(unpaidBill)).toBe("Record the payment first");
  });

  it("lets a paid or an empty bill close", () => {
    expect(closeBlock(paidBill)).toBeNull();
    expect(closeBlock({ totalCents: 0, payment: null })).toBeNull();
  });

  it("waits for the bill, but leaves a bill that failed to load to the server", () => {
    expect(closeBlock(undefined)).toBe("Loading the bill…");
    expect(closeBlock(null)).toBeNull();
  });

  it("lets only owners and admins close without payment", () => {
    expect(canCloseUnpaid({ role: "owner" })).toBe(true);
    expect(canCloseUnpaid({ role: "admin" })).toBe(true);
    expect(canCloseUnpaid({ role: "bar" })).toBe(false);
    expect(canCloseUnpaid({ position: "kitchen" })).toBe(false);
    expect(canCloseUnpaid(null)).toBe(false);
  });

  it("tells an unpaid answer apart from other failures", () => {
    expect(closeResult({ response: { status: 409, data: { code: "BILL_UNPAID" } } })).toBe("unpaid");
    expect(closeResult({ response: { status: 409, data: { code: "BILL_PAID" } } })).toBe("failed");
    expect(closeResult(new Error("offline"))).toBe("failed");
  });
});
