import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../../App";
import { AuthProvider } from "../../../contexts/AuthContext";
import { ContextProvider } from "../../../contexts/ContextProvider";
import { onlinePaymentErrors, payoutAccounts } from "../../../mocks/fixtures/onlinePayments";
import { apiPaths } from "../../../mocks/handlers/paths";
import {
  mockOnlinePaymentsSwitchResponse,
  mockPayoutAccountResponse,
  mockPayoutOnboardingResponse,
} from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";

const STRIPE_URL = "https://connect.stripe.test/setup/abc";

const realLocation = window.location;
let assign: ReturnType<typeof vi.fn>;
let scrollIntoView: ReturnType<typeof vi.fn>;

/** `location.assign` cannot be spied on in jsdom, so the test swaps in a location that records it. */
beforeEach(() => {
  assign = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: new Proxy({} as Location, {
      get: (_, key) => {
        if (key === "assign") {
          return assign;
        }
        const value = Reflect.get(realLocation, key, realLocation);
        return typeof value === "function" ? value.bind(realLocation) : value;
      },
    }),
  });
  scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  Object.defineProperty(window, "location", { configurable: true, value: realLocation });
  clearTokens();
  window.history.pushState({}, "", "/");
});

/** Every request to the Payout Account, by method. */
const recordPayoutRequests = () => {
  const methods: string[] = [];
  server.events.on("request:start", ({ request }) => {
    if (new URL(request.url).pathname.endsWith("/restaurant/payout-account")) {
      methods.push(request.method);
    }
  });
  return methods;
};

/** Onboarding answers with the Stripe link after a short wait, so the pending state can be seen. */
const recordOnboarding = (answer: () => Response = () => HttpResponse.json({ url: STRIPE_URL })) => {
  const calls = { count: 0 };
  server.use(
    http.post(apiPaths.payoutAccount, async () => {
      calls.count += 1;
      await delay(30);
      return answer();
    })
  );
  return calls;
};

/** Signs in with this role and opens the Kasse page at `path`. */
const openKasseAs = (role: string, path = "/admin/kasse") => {
  server.use(http.get("*/auth/user", () => HttpResponse.json({ user: { _id: "u1", role } })));
  saveTokens({ accessToken: "test-token" });
  window.history.pushState({}, "", path);
  const user = userEvent.setup();
  render(
    <ContextProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ContextProvider>
  );
  return user;
};

// The first test in the file renders the whole app and loads the lazy Kasse page
// in a cold worker; on CI that alone can take about a second.
const section = async () =>
  within(await screen.findByRole("region", { name: "Online payments" }, { timeout: 5000 }));

/** What the browser fires when it shows the page; `persisted` is true when it came from the back/forward cache. */
const firePageShow = (persisted: boolean) => {
  const event = new Event("pageshow");
  Object.defineProperty(event, "persisted", { value: persisted });
  act(() => {
    window.dispatchEvent(event);
  });
};

describe("Kasse online payments", () => {
  it("explains online payments and offers setup when no Payout Account is connected", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.notConnected);
    openKasseAs("owner");

    const online = await section();
    expect(await online.findByText(/The money goes straight to your own Stripe account/)).toBeInTheDocument();
    expect(online.getByRole("button", { name: "Set up online payments" })).toBeEnabled();
  });

  it("offers to continue when Stripe's form is unfinished", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.onboardingUnfinished);
    openKasseAs("owner");

    const online = await section();
    expect(await online.findByText("Setup isn't finished")).toBeInTheDocument();
    expect(online.getByRole("button", { name: "Continue setup" })).toBeEnabled();
  });

  it("says Stripe is reviewing, with no button, and checks again on request", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.underReview);
    const methods = recordPayoutRequests();
    const user = openKasseAs("owner");

    const online = await section();
    expect(await online.findByText(/Stripe is reviewing your details/)).toBeInTheDocument();
    expect(online.queryByRole("button", { name: /setup|online payments/i })).not.toBeInTheDocument();

    mockPayoutAccountResponse(200, payoutAccounts.ready);
    await user.click(online.getByRole("button", { name: "Check again" }));

    expect(await online.findByText("Online payments are ready")).toBeInTheDocument();
    expect(methods).toEqual(["GET", "GET"]);
  });

  it("shows the switch when online payments are ready", async () => {
    openKasseAs("owner");

    const online = await section();
    expect(await online.findByText("Online payments are ready")).toBeInTheDocument();
    expect(online.getByRole("switch", { name: "Let guests pay online" })).toBeChecked();
  });

  it("shows nothing to an admin and never asks for the Payout Account", async () => {
    const methods = recordPayoutRequests();
    openKasseAs("admin");

    expect(await screen.findByText("tss-serial-0001")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Online payments" })).not.toBeInTheDocument();
    // The refunded online payments list is for admins too; nothing else mentions online payments.
    const refunds = screen.getByRole("region", { name: "Refunded online payments" });
    expect(screen.queryAllByText(/online payments/i).filter((node) => !refunds.contains(node))).toEqual([]);
    expect(methods).toEqual([]);
  });

  it("sends one POST on a button press and goes to the returned Stripe page", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.notConnected);
    const calls = recordOnboarding();
    const user = openKasseAs("owner");
    const online = await section();

    await user.dblClick(await online.findByRole("button", { name: "Set up online payments" }));

    expect(await online.findByRole("button", { name: "Opening Stripe…" })).toBeDisabled();
    await waitFor(() => expect(assign).toHaveBeenCalledWith(STRIPE_URL));
    expect(calls.count).toBe(1);
  });

  it("shows an error and keeps the button when Stripe cannot be reached", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.onboardingUnfinished);
    recordOnboarding(() => HttpResponse.json(onlinePaymentErrors.providerError.body, { status: 502 }));
    const user = openKasseAs("owner");
    const online = await section();

    await user.click(await online.findByRole("button", { name: "Continue setup" }));

    expect(await online.findByRole("alert")).toHaveTextContent(/couldn't open Stripe/);
    expect(online.getByRole("button", { name: "Continue setup" })).toBeEnabled();
    expect(assign).not.toHaveBeenCalled();
  });

  it("re-reads the status after returning from Stripe and clears the parameter", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.underReview);
    const methods = recordPayoutRequests();
    openKasseAs("owner", "/admin/kasse?payout=return");

    const online = await section();
    expect(await online.findByText(/Stripe is reviewing your details/)).toBeInTheDocument();
    await waitFor(() => expect(window.location.search).toBe(""));
    expect(window.location.pathname).toBe("/admin/kasse");
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(methods).toEqual(["GET"]);
  });

  it("asks for a fresh Stripe link without a click when the old one expired", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.onboardingUnfinished);
    const calls = recordOnboarding();
    openKasseAs("owner", "/admin/kasse?payout=refresh");

    const online = await section();
    expect(await online.findByRole("button", { name: "Opening Stripe…" })).toBeDisabled();
    await waitFor(() => expect(assign).toHaveBeenCalledWith(STRIPE_URL));
    expect(calls.count).toBe(1);
  });

  it("shows the error and the button when the fresh link cannot be made", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.onboardingUnfinished);
    recordOnboarding(() => HttpResponse.json(onlinePaymentErrors.providerError.body, { status: 502 }));
    openKasseAs("owner", "/admin/kasse?payout=refresh");

    const online = await section();
    expect(await online.findByRole("alert")).toHaveTextContent(/couldn't open Stripe/);
    expect(online.getByRole("button", { name: "Continue setup" })).toBeEnabled();
    expect(window.location.search).toBe("");
    expect(assign).not.toHaveBeenCalled();
  });

  it("switches online payments off with a PATCH", async () => {
    const bodies: unknown[] = [];
    server.use(
      http.patch(apiPaths.payoutAccount, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(payoutAccounts.readySwitchedOff);
      })
    );
    const user = openKasseAs("owner");
    const online = await section();
    const toggle = await online.findByRole("switch", { name: "Let guests pay online" });

    await user.click(toggle);

    expect(toggle).not.toBeChecked();
    await waitFor(() => expect(bodies).toEqual([{ onlinePaymentsEnabled: false }]));
    expect(toggle).not.toBeChecked();
  });

  it("turns the switch back and says so when the PATCH fails", async () => {
    mockOnlinePaymentsSwitchResponse(500, { message: "boom" });
    const user = openKasseAs("owner");
    const online = await section();
    const toggle = await online.findByRole("switch", { name: "Let guests pay online" });

    await user.click(toggle);

    expect(await online.findByRole("alert")).toHaveTextContent(/couldn't switch online payments off/i);
    expect(toggle).toBeChecked();
  });

  it("says online payments aren't available when Stripe isn't configured", async () => {
    const { status, body } = onlinePaymentErrors.stripeNotConfigured;
    mockPayoutAccountResponse(status, body);
    openKasseAs("owner");

    const online = await section();
    expect(await online.findByText("Online payments aren't available on this server yet.")).toBeInTheDocument();
    expect(online.queryByRole("button")).not.toBeInTheDocument();
  });

  it("says online payments aren't available when setup answers 503", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.notConnected);
    const { status, body } = onlinePaymentErrors.stripeNotConfigured;
    mockPayoutOnboardingResponse(status, body);
    const user = openKasseAs("owner");
    const online = await section();

    await user.click(await online.findByRole("button", { name: "Set up online payments" }));

    expect(await online.findByText("Online payments aren't available on this server yet.")).toBeInTheDocument();
    expect(online.queryByRole("button")).not.toBeInTheDocument();
  });

  it("enables the setup button again and re-reads the status after Back from Stripe", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.notConnected);
    recordOnboarding();
    const methods = recordPayoutRequests();
    const user = openKasseAs("owner");
    const online = await section();

    await user.click(await online.findByRole("button", { name: "Set up online payments" }));
    await waitFor(() => expect(assign).toHaveBeenCalledWith(STRIPE_URL));
    expect(online.getByRole("button", { name: "Opening Stripe…" })).toBeDisabled();

    mockPayoutAccountResponse(200, payoutAccounts.onboardingUnfinished);
    firePageShow(true);

    expect(await online.findByRole("button", { name: "Continue setup" })).toBeEnabled();
    expect(methods).toEqual(["GET", "POST", "GET"]);
  });

  it("changes nothing on a pageshow that is not from the back/forward cache", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.notConnected);
    recordOnboarding();
    const methods = recordPayoutRequests();
    const user = openKasseAs("owner");
    const online = await section();

    await user.click(await online.findByRole("button", { name: "Set up online payments" }));
    await waitFor(() => expect(assign).toHaveBeenCalledWith(STRIPE_URL));

    firePageShow(false);

    expect(online.getByRole("button", { name: "Opening Stripe…" })).toBeDisabled();
    expect(methods).toEqual(["GET", "POST"]);
  });

  it("says guests can't pay online when the switch is off, and not when it is on", async () => {
    mockPayoutAccountResponse(200, payoutAccounts.readySwitchedOff);
    const user = openKasseAs("owner");
    const online = await section();
    const toggle = await online.findByRole("switch", { name: "Let guests pay online" });

    expect(online.getByText("Online payments are ready")).toBeInTheDocument();
    expect(online.getByText("Guests can't pay online right now.")).toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toBeChecked();
    expect(online.queryByText("Guests can't pay online right now.")).not.toBeInTheDocument();
  });

  it("names the switch by its text, without a label wrapper", async () => {
    openKasseAs("owner");
    const online = await section();

    const toggle = await online.findByRole("switch", { name: "Let guests pay online" });

    expect(toggle).not.toHaveAttribute("aria-label");
    expect(toggle.closest("label")).toBeNull();
  });

  it("switches when the owner taps the text beside the switch", async () => {
    server.use(http.patch(apiPaths.payoutAccount, () => HttpResponse.json(payoutAccounts.readySwitchedOff)));
    const user = openKasseAs("owner");
    const online = await section();
    const toggle = await online.findByRole("switch", { name: "Let guests pay online" });

    await user.click(online.getByText("Let guests pay online"));

    expect(toggle).not.toBeChecked();
  });
});
