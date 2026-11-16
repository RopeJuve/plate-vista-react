// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import { recordRequests } from "../../../test/recordRequests";
import { cancelOnlinePayment, startOnlinePayment } from "../onlinePaymentApi";

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
