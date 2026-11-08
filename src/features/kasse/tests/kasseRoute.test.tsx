import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import App from "../../../App";
import { AuthProvider } from "../../../contexts/AuthContext";
import { ContextProvider } from "../../../contexts/ContextProvider";
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
});
