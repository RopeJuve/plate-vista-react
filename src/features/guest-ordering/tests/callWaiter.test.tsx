import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CustomerPage from "../../../Components/Customer/CustomerPage";
import ToastProvider from "../../../Components/ToastProvider";
import { ContextProvider } from "../../../contexts/ContextProvider";
import { SESSION_ID } from "../../../mocks/fixtures/bill";
import { server } from "../../../mocks/server";
import { ProtocolError, type EventData } from "../../../shared/realtime/protocol";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";

const GUEST_PATH = "/r/demo/t/qr-table-4";
const CALL = "Call waiter";
const COMING = "Waiter is on the way";

const call: EventData<"waiter.called"> = {
  sessionId: SESSION_ID,
  tableId: "table-4",
  tableNumber: 4,
  calledAt: "2026-11-07T19:10:00.000Z",
};

/** A guest who scanned table 4's QR code and joined its open session. */
const renderGuest = () => {
  server.use(
    http.post("*/auth/table/:qrCode", () =>
      HttpResponse.json({ token: "guest-token", session: { _id: SESSION_ID, tableId: "table-4", tableNumber: 4 } })
    ),
    http.get("*/r/:slug/menu-items", () => HttpResponse.json([]))
  );
  const realtime = createMockRealtime();
  const user = userEvent.setup();
  render(
    <ToastProvider>
      <ContextProvider>
        <RealtimeTestProviders realtime={realtime} path={GUEST_PATH}>
          <Routes>
            <Route path="/r/:slug/t/:qrCode" element={<CustomerPage />} />
          </Routes>
        </RealtimeTestProviders>
      </ContextProvider>
    </ToastProvider>
  );
  return { realtime, user };
};

const calls = (realtime: ReturnType<typeof createMockRealtime>) =>
  realtime.requests().filter((request) => request.type === "waiter.call");

beforeEach(() => {
  Element.prototype.scrollIntoView = () => undefined;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("guest calling a waiter", () => {
  it("calls a waiter and shows one is on the way until staff answer", async () => {
    const { realtime, user } = renderGuest();
    realtime.onRequest(() => ({ call }));

    await user.click(await screen.findByRole("button", { name: CALL }));

    expect(calls(realtime)).toHaveLength(1);
    expect(await screen.findByRole("button", { name: COMING })).toBeDisabled();

    realtime.emit("waiter.dismissed", { sessionId: SESSION_ID });

    expect(await screen.findByRole("button", { name: CALL })).toBeEnabled();
  });

  it("shows one is on the way when someone else at the table already called", async () => {
    const { realtime } = renderGuest();
    await screen.findByRole("button", { name: CALL });

    realtime.emit("waiter.called", call);

    expect(await screen.findByRole("button", { name: COMING })).toBeDisabled();
  });

  it("ignores calls and answers for another table", async () => {
    const { realtime } = renderGuest();
    await screen.findByRole("button", { name: CALL });

    realtime.emit("waiter.called", { ...call, sessionId: "session-other" });

    expect(screen.getByRole("button", { name: CALL })).toBeEnabled();
  });

  it("says so and lets the guest try again when the call did not go through", async () => {
    const { realtime, user } = renderGuest();
    realtime.onRequest(() => {
      throw new ProtocolError("INTERNAL", "Not connected");
    });

    await user.click(await screen.findByRole("button", { name: CALL }));

    expect(await screen.findByText("Couldn't call a waiter. Please try again.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: CALL })).toBeEnabled());
  });
});
