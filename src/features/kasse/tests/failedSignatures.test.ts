import { describe, expect, it } from "vitest";
import { failedSignatures } from "../../../mocks/fixtures/tse";
import {
  failedKindLabel,
  failedSignatureBadge,
  formatFailedAt,
  withFailedAttempt,
  withoutSignature,
} from "../failedSignatures";

describe("failedSignatureBadge", () => {
  it("is green and says all signed at 0", () => {
    expect(failedSignatureBadge(0)).toEqual({ tone: "ok", label: "All signed" });
  });

  it("is red and counts the failures above 0", () => {
    expect(failedSignatureBadge(3)).toEqual({ tone: "alert", label: "3 failed signatures" });
    expect(failedSignatureBadge(1)).toEqual({ tone: "alert", label: "1 failed signature" });
  });
});

describe("failedKindLabel", () => {
  it("names payments and orders", () => {
    expect(failedKindLabel("PAYMENT")).toBe("Payment");
    expect(failedKindLabel("ORDER")).toBe("Order");
  });
});

describe("formatFailedAt", () => {
  it("shows date and time as a German reader expects it", () => {
    expect(formatFailedAt(new Date(2026, 10, 7, 20, 12).toISOString())).toBe("07.11.2026, 20:12");
  });

  it("is empty for a missing or broken date", () => {
    expect(formatFailedAt("")).toBe("");
    expect(formatFailedAt("not a date")).toBe("");
  });
});

describe("withoutSignature", () => {
  it("drops only the matching kind and id", () => {
    const next = withoutSignature(failedSignatures, "PAYMENT", "payment-failed-1");
    expect(next.map((row) => row.id)).toEqual(["payment-failed-2", "order-failed-1"]);
  });

  it("keeps a row whose id matches but kind does not", () => {
    expect(withoutSignature(failedSignatures, "ORDER", "payment-failed-1")).toHaveLength(3);
  });
});

describe("withFailedAttempt", () => {
  it("counts one more attempt on the matching row only", () => {
    const next = withFailedAttempt(failedSignatures, "PAYMENT", "payment-failed-2");
    expect(next.map((row) => row.retryCount)).toEqual([1, 3, 0]);
    expect(failedSignatures[1].retryCount).toBe(2);
  });
});
