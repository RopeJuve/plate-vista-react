import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { useState } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CustomerPage from "../../../Components/Customer/CustomerPage";
import { ContextProvider } from "../../../contexts/ContextProvider";
import { SESSION_ID } from "../../../mocks/fixtures/bill";
import { paidBill } from "../../../mocks/fixtures/payments";
import { mockBillResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { ProtocolError, type EventData } from "../../../shared/realtime/protocol";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";

const GUEST_PATH = "/r/demo/t/qr-table-4";

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

/** The guest page with a way to take it off screen, and where the browser is. */
const LeavableGuestPage = () => {
  const [shown, setShown] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setShown(false)}>
        Leave
      </button>
      <p>At {useLocation().pathname}</p>
      {shown && <CustomerPage />}
    </>
  );
};

/** A guest who scanned table 4's QR code and joined its open session. */
const renderGuest = (page = <CustomerPage />) => {
  server.use(
    http.post("*/auth/table/:qrCode", () =>
      HttpResponse.json({ token: "guest-token", session: { _id: SESSION_ID, tableId: "table-4", tableNumber: 4 } })
    ),
    http.get("*/r/:slug/menu-items", () => HttpResponse.json([menuItem]))
  );
  const realtime = createMockRealtime();
  const user = userEvent.setup();
  render(
    <ContextProvider>
      <RealtimeTestProviders realtime={realtime} path={GUEST_PATH}>
        <Routes>
          <Route path="/r/:slug/t/:qrCode" element={page} />
          <Route path="/receipt/:receiptToken" element={<ReceiptProbe />} />
        </Routes>
      </RealtimeTestProviders>
    </ContextProvider>
  );
  return { realtime, user };
};

const billPaid = (sessionId: string): EventData<"bill.paid"> => ({
  sessionId,
  paymentId: "payment-1",
  receiptToken: "receipt-token-1",
  method: "CASH",
  totalCents: 2050,
});

beforeEach(() => {
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
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("guest when the bill is paid", () => {
  it("moves to the receipt when their own bill is paid", async () => {
    const { realtime } = renderGuest();
    await screen.findByRole("button", { name: "Add Tomato soup to cart" });

    realtime.emit("bill.paid", billPaid(SESSION_ID));

    expect(await screen.findByText("Receipt receipt-token-1")).toBeInTheDocument();
  });

  it("ignores a payment for another table's session", async () => {
    const { realtime } = renderGuest();
    await screen.findByRole("button", { name: "Add Tomato soup to cart" });

    realtime.emit("bill.paid", billPaid("session-other"));

    expect(screen.queryByText(/^Receipt/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Tomato soup to cart" })).toBeEnabled();
    expect(screen.queryByText("This bill is paid")).not.toBeInTheDocument();
  });

  it("locks ordering when the bill was already paid on load, with a link to the receipt", async () => {
    mockBillResponse(200, paidBill);
    renderGuest();

    expect(await screen.findByText("This bill is paid")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View receipt" })).toHaveAttribute("href", "/receipt/receipt-token-1");
    expect(await screen.findByRole("button", { name: "Add Tomato soup to cart" })).toBeDisabled();
  });

  it("shows the locked state when placing an order is rejected with BILL_PAID", async () => {
    const { realtime, user } = renderGuest();
    await user.click(await screen.findByRole("button", { name: "Add Tomato soup to cart" }));
    realtime.open();
    realtime.onRequest(() => {
      throw new ProtocolError("BILL_PAID", "Bill already paid");
    });
    mockBillResponse(200, paidBill);

    await user.click(screen.getByRole("button", { name: /Open cart/ }));
    await user.click(screen.getByRole("button", { name: "Order now" }));

    expect(await screen.findByText("This bill is already paid, so nothing more can be ordered.")).toBeInTheDocument();
    expect(await screen.findByText("This bill is paid")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry order" })).toBeDisabled();
  });

  it("stops listening once the guest page is gone", async () => {
    const { realtime, user } = renderGuest(<LeavableGuestPage />);
    await screen.findByRole("button", { name: "Add Tomato soup to cart" });

    await user.click(screen.getByRole("button", { name: "Leave" }));
    realtime.emit("bill.paid", billPaid(SESSION_ID));

    expect(screen.getByText(`At ${GUEST_PATH}`)).toBeInTheDocument();
    expect(screen.queryByText(/^Receipt/)).not.toBeInTheDocument();
  });
});
