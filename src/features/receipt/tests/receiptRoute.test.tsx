import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import App from "../../../App";
import { AuthProvider } from "../../../contexts/AuthContext";
import { ContextProvider } from "../../../contexts/ContextProvider";
import { SIGNED_RECEIPT_TOKEN, signedReceipt } from "../../../mocks/fixtures/receipts";
import { apiPaths } from "../../../mocks/handlers/paths";
import { server } from "../../../mocks/server";

afterEach(() => {
  window.history.pushState({}, "", "/");
});

describe("/receipt/:receiptToken", () => {
  it("shows the receipt without anyone signed in, and asks for it without a token", async () => {
    const authHeaders: Array<string | null> = [];
    server.use(
      http.get(apiPaths.receipt, ({ request }) => {
        authHeaders.push(request.headers.get("Authorization"));
        return HttpResponse.json(signedReceipt);
      })
    );
    window.history.pushState({}, "", `/receipt/${SIGNED_RECEIPT_TOKEN}`);
    render(
      <ContextProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ContextProvider>
    );

    expect(await screen.findByRole("heading", { name: "Plate Vista" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "TSE-Signatur" })).toBeInTheDocument();
    expect(window.location.pathname).toBe(`/receipt/${SIGNED_RECEIPT_TOKEN}`);
    expect(authHeaders).toEqual([null]);
  });
});
