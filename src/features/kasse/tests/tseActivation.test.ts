import { describe, expect, it } from "vitest";
import { formatTseDate, tseSetupProblem } from "../tseActivation";

const httpError = (status: number, data?: unknown) => ({ response: { status, data } });

describe("tseSetupProblem", () => {
  it("sends the owner to the legal details on 422 RESTAURANT_DETAILS_MISSING", () => {
    expect(tseSetupProblem(httpError(422, { code: "RESTAURANT_DETAILS_MISSING" }))).toBe("DETAILS_MISSING");
  });

  it("treats a 502 as a failed setup that can be retried", () => {
    expect(tseSetupProblem(httpError(502, { code: "TSE_SETUP_FAILED" }))).toBe("FAILED");
  });

  it("treats a network error (no response) as a failed setup", () => {
    expect(tseSetupProblem(new Error("Network Error"))).toBe("FAILED");
  });

  it("treats any other 422 as a failed setup", () => {
    expect(tseSetupProblem(httpError(422, { code: "VALIDATION" }))).toBe("FAILED");
  });
});

describe("formatTseDate", () => {
  it("formats the activation date the German way", () => {
    expect(formatTseDate("2026-11-01T09:00:00.000Z")).toBe("01.11.2026");
  });

  it("returns an empty string without a date", () => {
    expect(formatTseDate(undefined)).toBe("");
    expect(formatTseDate("not a date")).toBe("");
  });
});
