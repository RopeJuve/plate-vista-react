import { describe, expect, it } from "vitest";
import { lateRefunds } from "../../../mocks/fixtures/onlinePayments";
import { formatRefundedAt, refundReasonLabel, withNewerRefund, withOlderRefunds } from "../lateRefunds";

const [newest, middle, oldest] = lateRefunds;

describe("refundReasonLabel", () => {
  it("says why each Late Payment was refunded in plain words", () => {
    expect(refundReasonLabel("BILL_ALREADY_PAID")).toBe("Bill was already paid");
    expect(refundReasonLabel("BILL_NOT_FROZEN")).toBe("Payment arrived after it was cancelled");
    expect(refundReasonLabel("SESSION_CLOSED")).toBe("Table was already closed");
  });
});

describe("formatRefundedAt", () => {
  it("shows the local date and time", () => {
    const local = new Date(2026, 10, 7, 20, 12);
    expect(formatRefundedAt(local.toISOString())).toBe("07.11.2026, 20:12");
  });

  it("shows nothing for a missing or broken time", () => {
    expect(formatRefundedAt("")).toBe("");
    expect(formatRefundedAt("not a date")).toBe("");
  });
});

describe("withNewerRefund", () => {
  it("puts a new refund first", () => {
    expect(withNewerRefund([middle, oldest], newest)).toEqual([newest, middle, oldest]);
  });

  it("keeps the list as it is when the refund is already in it", () => {
    const rows = [newest, middle];
    expect(withNewerRefund(rows, { ...middle })).toBe(rows);
  });
});

describe("withOlderRefunds", () => {
  it("adds the next page after the rows already shown", () => {
    expect(withOlderRefunds([newest], [middle, oldest])).toEqual([newest, middle, oldest]);
  });

  it("skips refunds already shown, e.g. one that arrived live", () => {
    expect(withOlderRefunds([newest, middle], [middle, oldest])).toEqual([newest, middle, oldest]);
  });
});
