// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { lateRefunds, payoutAccounts } from "../../../mocks/fixtures/onlinePayments";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import { recordRequests } from "../../../test/recordRequests";
import {
  fetchOnlinePaymentRefunds,
  fetchPayoutAccount,
  setOnlinePaymentsEnabled,
  startPayoutOnboarding,
} from "../payoutAccountApi";

const requests = recordRequests();

beforeEach(() => {
  saveTokens({ accessToken: "owner-token" });
});

afterEach(() => clearTokens());

describe("payoutAccountApi", () => {
  it("starts onboarding with an owner POST and returns the link to send the browser to", async () => {
    const link = await startPayoutOnboarding();

    expect(link.url).toMatch(/^https?:\/\//);
    await expect(requests.only()).resolves.toMatchObject({
      method: "POST",
      path: "/restaurant/payout-account",
      authorization: "Bearer owner-token",
    });
  });

  it("reads the Payout Account", async () => {
    await expect(fetchPayoutAccount()).resolves.toEqual(payoutAccounts.ready);
    await expect(requests.only()).resolves.toMatchObject({
      method: "GET",
      path: "/restaurant/payout-account",
      authorization: "Bearer owner-token",
    });
  });

  it("switches online payments off with a PATCH and returns the new account", async () => {
    await expect(setOnlinePaymentsEnabled(false)).resolves.toEqual(payoutAccounts.readySwitchedOff);
    await expect(requests.only()).resolves.toMatchObject({
      method: "PATCH",
      path: "/restaurant/payout-account",
      authorization: "Bearer owner-token",
      body: { onlinePaymentsEnabled: false },
    });
  });

  it("lists the Late Payment refunds, newest first", async () => {
    const page = await fetchOnlinePaymentRefunds();

    expect(page).toEqual({ items: lateRefunds, nextBefore: null });
    await expect(requests.only()).resolves.toMatchObject({
      method: "GET",
      path: "/restaurant/online-payment-refunds",
      authorization: "Bearer owner-token",
    });
  });

  it("pages further back with `before`", async () => {
    const before = lateRefunds[0].refundedAt;

    const page = await fetchOnlinePaymentRefunds({ before });

    expect(page.items).toEqual(lateRefunds.slice(1));
    const request = await requests.only();
    expect(new URL(request.path, "http://x").searchParams.get("before")).toBe(before);
  });
});
