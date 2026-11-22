import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import App from "../../../App";
import { AuthProvider } from "../../../contexts/AuthContext";
import { ContextProvider } from "../../../contexts/ContextProvider";
import { cardReaderErrors, cardReaderLists, cardReaders } from "../../../mocks/fixtures/cardReaders";
import { apiPaths } from "../../../mocks/handlers/paths";
import {
  mockAddCardReaderResponse,
  mockAddSimulatedReaderResponse,
  mockCardReadersResponse,
  mockRemoveCardReaderResponse,
} from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import CardReadersSection from "../CardReadersSection";

afterEach(() => {
  clearTokens();
  window.history.pushState({}, "", "/");
});

const renderSection = ({ canOpenPayoutAccount = true } = {}) => {
  const user = userEvent.setup();
  render(<CardReadersSection canOpenPayoutAccount={canOpenPayoutAccount} />);
  return user;
};

const section = () => within(screen.getByRole("region", { name: "Card readers" }));

const readerList = async () => within(await screen.findByRole("list", { name: "Card readers" }));

/** Every body the API received for this method and path. */
const recordBodies = (method: "post", path: string) => {
  const bodies: unknown[] = [];
  server.events.on("request:start", async ({ request }) => {
    if (request.method.toLowerCase() === method && new URL(request.url).pathname.endsWith(path)) {
      bodies.push(await request.clone().json());
    }
  });
  return bodies;
};

describe("Kasse card readers", () => {
  it("lists each reader with its name, device type and whether it is online", async () => {
    renderSection();

    const list = await readerList();
    const bar = within(list.getByRole("listitem", { name: "Bar" }));
    expect(bar.getByText("Stripe Reader S700")).toBeInTheDocument();
    expect(bar.getByText("Online")).toBeInTheDocument();
    const terrasse = within(list.getByRole("listitem", { name: "Terrasse" }));
    expect(terrasse.getByText("BBPOS WisePOS E")).toBeInTheDocument();
    expect(terrasse.getByText("Offline")).toBeInTheDocument();
    const simulated = within(list.getByRole("listitem", { name: "Test reader" }));
    expect(simulated.getByText("Simulated WisePOS E")).toBeInTheDocument();
    expect(simulated.getByText("Taking payment · Table 4")).toBeInTheDocument();
  });

  it("says when there are no readers yet", async () => {
    mockCardReadersResponse(200, cardReaderLists.empty);
    renderSection();

    expect(await screen.findByText("No card readers yet.")).toBeInTheDocument();
  });

  it("adds a reader by its registration code and name, and lists it", async () => {
    const bodies = recordBodies("post", "/restaurant/card-readers");
    const user = renderSection();
    await readerList();

    await user.click(section().getByRole("button", { name: "Add reader" }));
    const dialog = within(await screen.findByRole("dialog", { name: "Add card reader" }));
    await user.type(dialog.getByLabelText("Registration code"), " sepia-cerulean-aqua ");
    await user.type(dialog.getByLabelText("Name"), "Küche");
    await user.click(dialog.getByRole("button", { name: "Add reader" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect((await readerList()).getByRole("listitem", { name: "Küche" })).toBeInTheDocument();
    expect(bodies).toEqual([{ registrationCode: "sepia-cerulean-aqua", name: "Küche" }]);
  });

  it("explains which readers work and what stays a Card Terminal", async () => {
    const user = renderSection();
    await readerList();

    await user.click(section().getByRole("button", { name: "Add reader" }));
    const dialog = within(await screen.findByRole("dialog", { name: "Add card reader" }));
    expect(dialog.getByText(/Stripe Reader S700, S710 and BBPOS WisePOS E/)).toBeInTheDocument();
    expect(dialog.getByText(/another Stripe account/)).toBeInTheDocument();
    expect(dialog.getByText(/Bluetooth readers/)).toBeInTheDocument();
    expect(dialog.getByText(/Card Terminal/)).toBeInTheDocument();
  });

  it("needs a code and a name before it sends anything", async () => {
    const bodies = recordBodies("post", "/restaurant/card-readers");
    const user = renderSection();
    await readerList();

    await user.click(section().getByRole("button", { name: "Add reader" }));
    const dialog = within(await screen.findByRole("dialog", { name: "Add card reader" }));
    await user.click(dialog.getByRole("button", { name: "Add reader" }));

    expect(await dialog.findByText("Enter the code the reader shows")).toBeInTheDocument();
    expect(dialog.getByText("Give the reader a name")).toBeInTheDocument();
    expect(bodies).toEqual([]);
  });

  it.each([
    [cardReaderErrors.codeInvalid, /That registration code doesn't work/],
    [cardReaderErrors.restaurantDetailsMissing, /Fill in the legal details first/],
    [cardReaderErrors.providerError, /Stripe didn't answer/],
  ])("shows the API's %# refusal in plain language and keeps the dialog open", async ({ status, body }, message) => {
    mockAddCardReaderResponse(status, body);
    const user = renderSection();
    await readerList();

    await user.click(section().getByRole("button", { name: "Add reader" }));
    const dialog = within(await screen.findByRole("dialog", { name: "Add card reader" }));
    await user.type(dialog.getByLabelText("Registration code"), "used-code");
    await user.type(dialog.getByLabelText("Name"), "Bar 2");
    await user.click(dialog.getByRole("button", { name: "Add reader" }));

    expect(await dialog.findByRole("alert")).toHaveTextContent(message);
    expect(dialog.getByLabelText("Name")).toHaveValue("Bar 2");
  });

  it("offers a simulated reader in test mode and lists the one added", async () => {
    const bodies = recordBodies("post", "/restaurant/card-readers/simulated");
    const user = renderSection();
    await readerList();

    await user.click(section().getByRole("button", { name: "Add simulated reader" }));
    const dialog = within(await screen.findByRole("dialog", { name: "Add simulated reader" }));
    expect(dialog.queryByLabelText("Registration code")).not.toBeInTheDocument();
    await user.type(dialog.getByLabelText("Name"), "Demo");
    await user.click(dialog.getByRole("button", { name: "Add simulated reader" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect((await readerList()).getByRole("listitem", { name: "Demo" })).toBeInTheDocument();
    expect(bodies).toEqual([{ name: "Demo" }]);
  });

  it("shows why a simulated reader was refused", async () => {
    mockAddSimulatedReaderResponse(cardReaderErrors.simulatedLiveMode.status, cardReaderErrors.simulatedLiveMode.body);
    const user = renderSection();
    await readerList();

    await user.click(section().getByRole("button", { name: "Add simulated reader" }));
    const dialog = within(await screen.findByRole("dialog", { name: "Add simulated reader" }));
    await user.type(dialog.getByLabelText("Name"), "Demo");
    await user.click(dialog.getByRole("button", { name: "Add simulated reader" }));

    expect(await dialog.findByRole("alert")).toHaveTextContent("Simulated readers only exist in test mode.");
  });

  it("offers no simulated reader outside test mode", async () => {
    mockCardReadersResponse(200, cardReaderLists.liveMode);
    renderSection();
    await readerList();

    expect(section().getByRole("button", { name: "Add reader" })).toBeEnabled();
    expect(section().queryByRole("button", { name: "Add simulated reader" })).not.toBeInTheDocument();
  });

  it("removes a reader only after confirming, then drops it from the list", async () => {
    const removed: string[] = [];
    server.events.on("request:start", ({ request }) => {
      if (request.method === "DELETE") {
        removed.push(new URL(request.url).pathname);
      }
    });
    const user = renderSection();
    const list = await readerList();

    await user.click(list.getByRole("button", { name: "Remove Terrasse" }));
    const dialog = within(await screen.findByRole("dialog", { name: "Remove Terrasse?" }));
    await user.click(dialog.getByRole("button", { name: "Keep reader" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(removed).toEqual([]);

    await user.click(list.getByRole("button", { name: "Remove Terrasse" }));
    await user.click(
      within(await screen.findByRole("dialog", { name: "Remove Terrasse?" })).getByRole("button", {
        name: "Remove reader",
      })
    );

    await waitFor(() => expect(list.queryByRole("listitem", { name: "Terrasse" })).not.toBeInTheDocument());
    expect(list.getByRole("listitem", { name: "Bar" })).toBeInTheDocument();
    expect(removed).toEqual([`/api/v1/restaurant/card-readers/${cardReaders.terrasse.id}`]);
  });

  it("keeps a reader that is taking a payment and says why", async () => {
    mockRemoveCardReaderResponse(cardReaderErrors.busy.status, cardReaderErrors.busy.body);
    const user = renderSection();
    const list = await readerList();

    await user.click(list.getByRole("button", { name: "Remove Test reader" }));
    const dialog = within(await screen.findByRole("dialog", { name: "Remove Test reader?" }));
    await user.click(dialog.getByRole("button", { name: "Remove reader" }));

    expect(await dialog.findByRole("alert")).toHaveTextContent(
      "This reader is taking a payment for table 4. Cancel that payment first."
    );
    await user.click(dialog.getByRole("button", { name: "Keep reader" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(list.getByRole("listitem", { name: "Test reader" })).toBeInTheDocument();
  });

  it("makes adding unavailable while the Payout Account can't take payments, linking to it", async () => {
    mockCardReadersResponse(200, cardReaderLists.payoutNotReady);
    renderSection();

    expect(await screen.findByText(/once the Payout Account can take payments/)).toBeInTheDocument();
    expect(section().getByRole("button", { name: "Add reader" })).toBeDisabled();
    expect(section().getByRole("button", { name: "Add simulated reader" })).toBeDisabled();
    expect(section().getByRole("link", { name: "Payout Account" })).toHaveAttribute("href", "#online-payments");
  });

  it("tells an admin who can't open the Payout Account to ask the owner", async () => {
    mockCardReadersResponse(200, cardReaderLists.payoutNotReady);
    renderSection({ canOpenPayoutAccount: false });

    expect(await screen.findByText(/Ask the owner to finish setting up the Payout Account/)).toBeInTheDocument();
    expect(section().queryByRole("link", { name: "Payout Account" })).not.toBeInTheDocument();
  });

  it("says when this server has no card readers", async () => {
    mockCardReadersResponse(cardReaderErrors.stripeNotConfigured.status, cardReaderErrors.stripeNotConfigured.body);
    renderSection();

    expect(await screen.findByText("Card readers aren't available on this server yet.")).toBeInTheDocument();
    expect(section().queryByRole("button", { name: "Add reader" })).not.toBeInTheDocument();
  });

  it("offers a reload when the readers could not be loaded", async () => {
    mockCardReadersResponse(500, { code: "INTERNAL" });
    const user = renderSection();

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load the card readers.");
    server.use(http.get(apiPaths.cardReaders, () => HttpResponse.json(cardReaderLists.liveMode)));
    await user.click(section().getByRole("button", { name: "Reload" }));

    expect((await readerList()).getByRole("listitem", { name: "Bar" })).toBeInTheDocument();
  });
});

/** Signs in with this role and opens the Kasse page. */
const openKasseAs = (user: Record<string, string>) => {
  server.use(http.get("*/auth/user", () => HttpResponse.json({ user: { _id: "u1", ...user } })));
  saveTokens({ accessToken: "test-token" });
  window.history.pushState({}, "", "/admin/kasse");
  render(
    <ContextProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ContextProvider>
  );
};

describe("Kasse card readers by role", () => {
  it.each(["owner", "admin"])("are managed by the %s", async (role) => {
    openKasseAs({ role });

    expect(await screen.findByRole("region", { name: "Card readers" }, { timeout: 5000 })).toBeInTheDocument();
  });

  it.each(["bar", "kitchen"])("are not shown to %s staff", async (position) => {
    openKasseAs({ position });

    await waitFor(() => expect(window.location.pathname).toBe("/login"));
    expect(screen.queryByRole("region", { name: "Card readers" })).not.toBeInTheDocument();
  });
});
