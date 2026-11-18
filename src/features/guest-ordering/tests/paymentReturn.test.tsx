import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { useState } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CustomerPage from "../../../Components/Customer/CustomerPage";
import { ContextProvider } from "../../../contexts/ContextProvider";
import { frozenBill, SESSION_ID, unpaidBill } from "../../../mocks/fixtures/bill";
import { onlinePaymentErrors } from "../../../mocks/fixtures/onlinePayments";
import { apiPaths } from "../../../mocks/handlers/paths";
import { mockBillResponse, mockCancelOnlinePaymentResponse, mockReceiptTokenResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { formatCents } from "../../../shared/money/formatCents";
import type { EventData } from "../../../shared/realtime/protocol";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";

const GUEST_PATH = "/r/demo/t/qr-table-4";
const CONFIRMING = "Confirming your payment…";
const NOT_COMPLETED = "Payment not completed";
const ASK_STAFF = "We couldn't confirm your payment yet. Please ask the staff.";
const FROZEN_BANNER = "Someone at your table is paying online.";

const menuItem = {
  _id: "dish-soup",
  title: "Tomato soup",
  description: "",
  priceCents: 650,
  image: "",
  category: "Starters",
  inStock: true,
  station: "kitchen",
  popular: false,
};

const ReceiptProbe = () => <p>Receipt {useParams().receiptToken}</p>;

/** The guest page with a way to take it off screen and back, and where the browser is. */
const LeavableGuestPage = () => {
  const [shown, setShown] = useState(true);
  const location = useLocation();
  return (
    <>
      <button type="button" onClick={() => setShown((current) => !current)}>
        Toggle page
      </button>
      <p>
        At {location.pathname}
        {location.search}
      </p>
      {shown && <CustomerPage />}
    </>
  );
};

/** Counts the guest page's receipt-token checks and online payment cancels. */
const recordCalls = () => {
  const calls = { checks: 0, cancels: [] as (string | null)[] };
  server.events.on("request:start", ({ request }) => {
    const path = new URL(request.url).pathname;
    if (request.method === "GET" && path.endsWith("/receipt-token")) {
      calls.checks += 1;
    }
    if (request.method === "POST" && path.endsWith("/online-payment/cancel")) {
      calls.cancels.push(request.headers.get("authorization"));
    }
  });
  return calls;
};

/** A guest of table 4 coming back from the payment page with `?payment=<arrival>`. */
const renderGuest = (arrival: string) => {
  server.use(
    http.post("*/auth/table/:qrCode", () =>
      HttpResponse.json({ token: "guest-token", session: { _id: SESSION_ID, tableId: "table-4", tableNumber: 4 } })
    ),
    http.get("*/r/:slug/menu-items", () => HttpResponse.json([menuItem]))
  );
  const realtime = createMockRealtime();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(
    <ContextProvider>
      <RealtimeTestProviders realtime={realtime} path={`${GUEST_PATH}?payment=${arrival}`}>
        <Routes>
          <Route path="/r/:slug/t/:qrCode" element={<LeavableGuestPage />} />
          <Route path="/receipt/:receiptToken" element={<ReceiptProbe />} />
        </Routes>
      </RealtimeTestProviders>
    </ContextProvider>
  );
  return { realtime, user };
};

/** Lets the clock move by `ms` and every request and render it triggers settle. */
const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

const addSoup = () => screen.findByRole("button", { name: "Add Tomato soup to cart" });

const billPaid: EventData<"bill.paid"> = {
  sessionId: SESSION_ID,
  paymentId: "payment-1",
  receiptToken: "receipt-token-1",
  method: "ONLINE",
  totalCents: 2050,
};

beforeEach(() => {
  // Real time still moves the fake clock, so `findBy*` keeps working; tests jump ahead with `advance`.
  vi.useFakeTimers({
    shouldAdvanceTime: true,
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"],
  });
  // The category row measures and scrolls itself; jsdom does neither.
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
  server.events.removeAllListeners();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("guest back from paying online (?payment=return)", () => {
  it("shows the confirming state instead of the menu, and moves to the receipt on bill.paid", async () => {
    mockBillResponse(200, frozenBill);
    const calls = recordCalls();
    const { realtime } = renderGuest("return");

    expect(await screen.findByText(CONFIRMING)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Tomato soup to cart" })).not.toBeInTheDocument();

    expect(await screen.findByText(`At ${GUEST_PATH}`)).toBeInTheDocument();
    realtime.emit("bill.paid", billPaid);

    expect(await screen.findByText("Receipt receipt-token-1")).toBeInTheDocument();
    const checks = calls.checks;
    await advance(10_000);
    expect(calls.checks).toBe(checks);
  });

  it("keeps waiting while the payment is going through (202), then moves to the receipt (200)", async () => {
    mockReceiptTokenResponse(202, { status: "PAYING" });
    const calls = recordCalls();
    renderGuest("return");
    await screen.findByText(CONFIRMING);
    await waitFor(() => expect(calls.checks).toBe(1));

    await advance(2_000);
    expect(calls.checks).toBe(2);
    expect(screen.getByText(CONFIRMING)).toBeInTheDocument();

    mockReceiptTokenResponse(200, { receiptToken: "receipt-token-2" });
    await advance(2_000);

    expect(await screen.findByText("Receipt receipt-token-2")).toBeInTheDocument();
  });

  it("says the payment was not completed (404) and gives back the page, with pay online", async () => {
    mockReceiptTokenResponse(404, { code: "NOT_FOUND" });
    const calls = recordCalls();
    const { user } = renderGuest("return");

    expect(await screen.findByText(NOT_COMPLETED)).toBeInTheDocument();
    expect(await addSoup()).toBeEnabled();
    await user.click(screen.getByRole("button", { name: /Open cart/ }));
    await user.click(screen.getByRole("button", { name: "Bill" }));
    expect(await screen.findByRole("button", { name: `Pay online ${formatCents(2050)}` })).toBeEnabled();

    await advance(10_000);
    expect(calls.checks).toBe(1);
  });

  it("asks for the staff after 60 s without an answer, and checks once more on Check again", async () => {
    const calls = recordCalls();
    const { user } = renderGuest("return");
    await screen.findByText(CONFIRMING);

    await advance(60_000);

    expect(await screen.findByText(ASK_STAFF)).toBeInTheDocument();
    const checks = calls.checks;
    await advance(10_000);
    expect(calls.checks).toBe(checks);

    await user.click(screen.getByRole("button", { name: "Check again" }));

    await waitFor(() => expect(calls.checks).toBe(checks + 1));
    expect(screen.getByText(CONFIRMING)).toBeInTheDocument();
    mockReceiptTokenResponse(200, { receiptToken: "receipt-token-3" });
    await advance(2_000);
    expect(await screen.findByText("Receipt receipt-token-3")).toBeInTheDocument();
  });

  it("removes the parameter once handled, and stops checking when the page goes away", async () => {
    const calls = recordCalls();
    const { user } = renderGuest("return");
    await screen.findByText(CONFIRMING);
    await waitFor(() => expect(calls.checks).toBe(1));
    expect(screen.getByText(`At ${GUEST_PATH}`)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Toggle page" }));
    await advance(60_000);

    expect(calls.checks).toBe(1);
  });
});

describe("guest who went back from the payment page (?payment=cancelled)", () => {
  it("cancels once with the guest token and shows the page unfrozen", async () => {
    let cancelled = false;
    server.use(
      http.get(apiPaths.bill, () => HttpResponse.json(cancelled ? unpaidBill : frozenBill)),
      http.post(apiPaths.cancelOnlinePayment, () => {
        cancelled = true;
        return new HttpResponse(null, { status: 200 });
      })
    );
    const calls = recordCalls();
    renderGuest("cancelled");

    await waitFor(async () => expect(await addSoup()).toBeEnabled());
    expect(screen.queryByText(FROZEN_BANNER)).not.toBeInTheDocument();
    expect(screen.queryByText(CONFIRMING)).not.toBeInTheDocument();
    expect(calls.cancels).toEqual(["Bearer guest-token"]);
  });

  it("removes the parameter, and showing the page again does not cancel again", async () => {
    const calls = recordCalls();
    const { user } = renderGuest("cancelled");
    await waitFor(() => expect(calls.cancels).toHaveLength(1));
    await waitFor(() => expect(screen.getByText(`At ${GUEST_PATH}`)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Toggle page" }));
    await user.click(screen.getByRole("button", { name: "Toggle page" }));
    await addSoup();

    expect(calls.cancels).toHaveLength(1);
  });

  it("waits for the payment when it is already going through in another tab (409)", async () => {
    mockCancelOnlinePaymentResponse(onlinePaymentErrors.billPayingOnline.status, onlinePaymentErrors.billPayingOnline.body);
    mockReceiptTokenResponse(200, { receiptToken: "receipt-token-4" });
    const calls = recordCalls();
    renderGuest("cancelled");

    expect(await screen.findByText("Receipt receipt-token-4")).toBeInTheDocument();
    expect(calls.cancels).toHaveLength(1);
  });

  it("shows the page as it is when the cancel gets no answer, frozen banner included", async () => {
    mockBillResponse(200, frozenBill);
    server.use(http.post(apiPaths.cancelOnlinePayment, () => HttpResponse.error()));
    renderGuest("cancelled");

    expect(await screen.findByText(FROZEN_BANNER)).toBeInTheDocument();
    expect(screen.queryByText(CONFIRMING)).not.toBeInTheDocument();
  });
});
