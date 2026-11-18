// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import { recordRequests } from "../../../test/recordRequests";
import { mockReceiptTokenResponse } from "../../../mocks/overrides";
import { cancelOnlinePayment, fetchReceiptToken, startOnlinePayment } from "../onlinePaymentApi";

const requests = recordRequests();

afterEach(() => clearTokens());

describe("startOnlinePayment", () => {
  it("lets a guest start with their table token, and never leaves the app's own origin in mocks", async () => {
    const started = await startOnlinePayment("session-1", "guest-token");

    expect(new URL(started.url).origin).toBe(window.location.origin);
    expect(Date.parse(started.expiresAt)).not.toBeNaN();
    await expect(requests.only()).resolves.toMatchObject({
      method: "POST",
      path: "/sessions/session-1/online-payment",
      authorization: "Bearer guest-token",
    });
  });

  it("lets staff start through the shared client", async () => {
    saveTokens({ accessToken: "staff-token" });

    await startOnlinePayment("session 2");

    await expect(requests.only()).resolves.toMatchObject({
      method: "POST",
      path: "/sessions/session%202/online-payment",
      authorization: "Bearer staff-token",
    });
  });
});

describe("cancelOnlinePayment", () => {
  it("lets a guest go back with their table token", async () => {
    await expect(cancelOnlinePayment("session-1", "guest-token")).resolves.toBeUndefined();
    await expect(requests.only()).resolves.toMatchObject({
      method: "POST",
      path: "/sessions/session-1/online-payment/cancel",
      authorization: "Bearer guest-token",
    });
  });

  it("lets staff unfreeze through the shared client", async () => {
    saveTokens({ accessToken: "staff-token" });

    await cancelOnlinePayment("session-1");

    await expect(requests.only()).resolves.toMatchObject({
      method: "POST",
      path: "/sessions/session-1/online-payment/cancel",
      authorization: "Bearer staff-token",
    });
  });
});

describe("fetchReceiptToken", () => {
  it("asks with the guest's table token and reads a paid bill's receipt token (200)", async () => {
    mockReceiptTokenResponse(200, { receiptToken: "receipt-token-1" });

    await expect(fetchReceiptToken("session-1", "guest-token")).resolves.toEqual({
      state: "PAID",
      receiptToken: "receipt-token-1",
    });
    await expect(requests.only()).resolves.toMatchObject({
      method: "GET",
      path: "/sessions/session-1/receipt-token",
      authorization: "Bearer guest-token",
    });
  });

  it("reads a payment still going through (202)", async () => {
    mockReceiptTokenResponse(202, { status: "PAYING" });

    await expect(fetchReceiptToken("session-1", "guest-token")).resolves.toEqual({ state: "PAYING" });
  });

  it("reads a bill that is open again (404)", async () => {
    mockReceiptTokenResponse(404, { code: "NOT_FOUND" });

    await expect(fetchReceiptToken("session-1", "guest-token")).resolves.toEqual({ state: "NOT_PAID" });
  });

  it("fails on anything else, e.g. a server error", async () => {
    mockReceiptTokenResponse(500);

    await expect(fetchReceiptToken("session-1", "guest-token")).rejects.toBeTruthy();
  });
});
