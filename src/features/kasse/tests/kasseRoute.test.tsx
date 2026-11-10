import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import App from "../../../App";
import { AuthProvider } from "../../../contexts/AuthContext";
import { ContextProvider } from "../../../contexts/ContextProvider";
import { activeTseWithFailures } from "../../../mocks/fixtures/tse";
import { mockTseRetryResponse, mockTseResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";

/** Signs in as someone with this role and opens the app on the Kasse page. */
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

afterEach(() => {
  clearTokens();
  window.history.pushState({}, "", "/");
});

describe("/admin/kasse", () => {
  it("opens for the owner", async () => {
    openKasseAs({ role: "owner" });
    expect(await screen.findByRole("heading", { name: "Till & payments" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Till & payments" }).length).toBeGreaterThan(0);
  });

  it("opens for an admin", async () => {
    openKasseAs({ role: "admin" });
    expect(await screen.findByRole("heading", { name: "Till & payments" })).toBeInTheDocument();
  });

  it.each(["bar", "kitchen"])("sends %s staff to the login instead", async (position) => {
    openKasseAs({ position });
    await waitFor(() => expect(window.location.pathname).toBe("/login"));
    expect(screen.queryByRole("heading", { name: "Till & payments" })).not.toBeInTheDocument();
  });

  it("shows no failed-signature badge in the nav when everything is signed", async () => {
    openKasseAs({ role: "owner" });
    await screen.findByText("All signed");
    const [link] = screen.getAllByRole("link", { name: "Till & payments" });
    expect(link).toHaveAccessibleName("Till & payments");
  });

  it("shows the failed-signature count in the nav and lowers it after a retry signs one", async () => {
    mockTseResponse(200, activeTseWithFailures);
    mockTseRetryResponse(200, { status: "SIGNED" });
    const user = userEvent.setup();
    openKasseAs({ role: "owner" });

    const link = await screen.findByRole("link", { name: /Till & payments.*3 failed signatures/ });
    expect(within(link).getByText("3")).toBeInTheDocument();

    await screen.findByRole("table");
    const [retry] = screen.getAllByRole("button", { name: "Retry" });
    await user.click(retry);

    await waitFor(() => expect(link).toHaveAccessibleName(/2 failed signatures/));
  });
});
