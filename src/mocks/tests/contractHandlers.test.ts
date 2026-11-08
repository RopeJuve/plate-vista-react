import { describe, expect, it } from "vitest";
import {
  FAILED_RECEIPT_TOKEN,
  MISSING_RECEIPT_TOKEN,
  PENDING_RECEIPT_TOKEN,
  SIGNED_RECEIPT_TOKEN,
} from "../fixtures/receipts";
import { activeTseWithFailures, inactiveTse } from "../fixtures/tse";
import { mockTseResponse } from "../overrides";

const API = "http://localhost/api/v1";

const call = async (path: string, init?: RequestInit) => {
  const response = await fetch(`${API}${path}`, init);
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
};

const post = (path: string, body: unknown) =>
  call(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

describe("contract handlers", () => {
  it("serves categories with both VAT rates", async () => {
    const { body } = await call("/categories");
    expect(new Set(body.map((category: { vatRate: string }) => category.vatRate))).toEqual(
      new Set(["NORMAL", "REDUCED_1"])
    );
  });

  it("refuses to close an unpaid bill unless a reason is given", async () => {
    await expect(post("/sessions/session-1/close", {})).resolves.toEqual({
      status: 409,
      body: { code: "BILL_UNPAID" },
    });
    await expect(post("/sessions/session-1/close", { unpaidReason: "Guest left" })).resolves.toMatchObject({
      status: 204,
    });
  });

  it("serves an unpaid bill by default", async () => {
    const { body } = await call("/sessions/session-9/bill");
    expect(body).toMatchObject({ sessionId: "session-9", payment: null });
  });

  it("serves signed, pending and failed receipts, and 404 for an unknown token", async () => {
    expect((await call(`/receipts/${SIGNED_RECEIPT_TOKEN}`)).body.signature.status).toBe("SIGNED");
    expect((await call(`/receipts/${PENDING_RECEIPT_TOKEN}`)).body.signature.status).toBe("PENDING");
    expect((await call(`/receipts/${FAILED_RECEIPT_TOKEN}`)).body.signature.status).toBe("FAILED");
    expect((await call(`/receipts/${MISSING_RECEIPT_TOKEN}`)).status).toBe(404);
  });

  it("rejects incomplete legal details with 400 VALIDATION", async () => {
    const { status, body } = await call("/restaurant/legal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ legalName: "" }),
    });
    expect(status).toBe(400);
    expect(body.code).toBe("VALIDATION");
  });

  it("lets a test switch the TSE between inactive and active with failures", async () => {
    mockTseResponse(200, inactiveTse);
    expect((await call("/tse")).body).toEqual(inactiveTse);

    mockTseResponse(200, activeTseWithFailures);
    expect((await call("/tse")).body.failedSignatures).toBe(3);
  });
});
