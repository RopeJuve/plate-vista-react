import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { retryProblem } from "../cardReaderProblem";

const answer = (status: number, data?: unknown) =>
  new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "",
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe("retryProblem", () => {
  it("says there is nothing left to retry on a 404, and reloads the bill", () => {
    expect(retryProblem(answer(404))).toEqual({
      message: "There is no failed card reader payment to retry any more.",
      reloadsBill: true,
    });
  });

  it("reads a changed bill like a new start does, with the new total, and reloads it", () => {
    const problem = retryProblem(answer(409, { code: "BILL_CHANGED", details: { totalCents: 2750 } }));
    expect(problem.message).toMatch(/^The bill changed — new total 27,50\s€\. Please start again\.$/);
    expect(problem.reloadsBill).toBe(true);
  });

  it("names the reader already taking the bill", () => {
    const error = answer(409, {
      code: "PAYMENT_IN_PROGRESS",
      details: { kind: "CARD_READER", readerName: "Terrasse" },
    });
    expect(retryProblem(error).message).toBe("This bill is already being paid on the card reader “Terrasse”.");
  });

  it("asks to try again when the server can't be reached, keeping the bill on screen", () => {
    expect(retryProblem(new Error("Network Error"))).toEqual({
      message: "Could not reach the server. Try again.",
      reloadsBill: false,
    });
  });
});
