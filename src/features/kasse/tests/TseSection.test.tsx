import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { describe, expect, it } from "vitest";
import ToastProvider from "../../../Components/ToastProvider";
import { emptyLegalDetails } from "../../../mocks/fixtures/legal";
import { activeTse, inactiveTse } from "../../../mocks/fixtures/tse";
import { apiPaths } from "../../../mocks/handlers/paths";
import { mockLegalResponse, mockTseResponse, mockTseSetupResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import Kasse from "../../../pages/Kasse";

/** Counts setup calls; each answer waits a little so a second click lands while the first runs. */
const recordSetups = (answer: () => Response = () => HttpResponse.json(activeTse)) => {
  const calls = { count: 0 };
  server.use(
    http.post(apiPaths.tseSetup, async () => {
      calls.count += 1;
      await delay(30);
      return answer();
    })
  );
  return calls;
};

const renderKasse = () => {
  const user = userEvent.setup();
  render(
    <ToastProvider>
      <Kasse />
    </ToastProvider>
  );
  return user;
};

const activateButton = () => screen.findByRole("button", { name: "Activate TSE" });

describe("Kasse TSE section", () => {
  it("shows the active TSE with serial, client ID and activation date", async () => {
    renderKasse();

    expect(await screen.findByText("Active")).toBeInTheDocument();
    expect(screen.getByText("tss-serial-0001")).toBeInTheDocument();
    expect(screen.getByText("client-0001")).toBeInTheDocument();
    expect(screen.getByText("01.11.2026")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Activate TSE" })).not.toBeInTheDocument();
  });

  it("activates an inactive TSE and then shows it as active", async () => {
    mockTseResponse(200, inactiveTse);
    const calls = recordSetups();
    const user = renderKasse();

    expect(await screen.findByText(/German law requires every order and payment to be signed by a TSE/)).toBeInTheDocument();
    const button = await activateButton();
    await waitFor(() => expect(button).toBeEnabled());
    await user.click(button);

    expect(await screen.findByText("tss-serial-0001")).toBeInTheDocument();
    expect(screen.getByText("client-0001")).toBeInTheDocument();
    expect(calls.count).toBe(1);
  });

  it("sends exactly one setup request on a double click", async () => {
    mockTseResponse(200, inactiveTse);
    const calls = recordSetups();
    const user = renderKasse();
    const button = await activateButton();
    await waitFor(() => expect(button).toBeEnabled());

    await user.dblClick(button);

    expect(await screen.findByText("tss-serial-0001")).toBeInTheDocument();
    expect(calls.count).toBe(1);
  });

  it("shows a loading state and keeps the button disabled while activating", async () => {
    mockTseResponse(200, inactiveTse);
    recordSetups();
    const user = renderKasse();
    const button = await activateButton();
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);

    expect(await screen.findByRole("button", { name: "Activating TSE…" })).toBeDisabled();
    expect(await screen.findByText("tss-serial-0001")).toBeInTheDocument();
  });

  it("disables activation and explains why while the legal details are incomplete", async () => {
    mockLegalResponse(200, emptyLegalDetails);
    mockTseResponse(200, inactiveTse);
    const calls = recordSetups();
    renderKasse();

    expect(await screen.findByText(/fill in the legal details above/i)).toBeInTheDocument();
    expect(await activateButton()).toBeDisabled();
    expect(calls.count).toBe(0);
  });

  it("points to the legal details when the server says they are missing", async () => {
    mockTseResponse(200, inactiveTse);
    mockTseSetupResponse(422, { code: "RESTAURANT_DETAILS_MISSING" });
    const user = renderKasse();
    const button = await activateButton();
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);

    const link = await screen.findByRole("link", { name: /legal details/i });
    expect(link).toHaveAttribute("href", "#legal-details");
  });

  it("shows a readable message on a 502 and retries setup", async () => {
    mockTseResponse(200, inactiveTse);
    let failNext = true;
    const calls = recordSetups(() => {
      if (failNext) {
        failNext = false;
        return HttpResponse.json({ code: "TSE_SETUP_FAILED" }, { status: 502 });
      }
      return HttpResponse.json(activeTse);
    });
    const user = renderKasse();
    const button = await activateButton();
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);
    expect(await screen.findByText(/could not activate the TSE/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("tss-serial-0001")).toBeInTheDocument();
    expect(calls.count).toBe(2);
  });

  it("shows a readable message on a network error", async () => {
    mockTseResponse(200, inactiveTse);
    server.use(http.post(apiPaths.tseSetup, () => HttpResponse.error()));
    const user = renderKasse();
    const button = await activateButton();
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);

    expect(await screen.findByText(/could not activate the TSE/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
  });

  it("never shows a PIN, PUK or key from the answer", async () => {
    mockTseResponse(200, { ...activeTse, adminPin: "123456", puk: "999999", secretKey: "s3cr3t" });
    renderKasse();

    await screen.findByText("tss-serial-0001");
    for (const secret of ["123456", "999999", "s3cr3t"]) {
      expect(screen.queryByText(secret, { exact: false })).not.toBeInTheDocument();
    }
  });
});
