import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes, useParams } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CustomerPage from "../../../Components/Customer/CustomerPage";
import { ContextProvider } from "../../../contexts/ContextProvider";
import { frozenBill, SESSION_ID, unpaidBill } from "../../../mocks/fixtures/bill";
import { guestCardReaderPayingBill } from "../../../mocks/fixtures/cardReaders";
import { onlinePaymentErrors } from "../../../mocks/fixtures/onlinePayments";
import { apiPaths } from "../../../mocks/handlers/paths";
import { mockBillResponse, mockStartOnlinePaymentResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { formatCents } from "../../../shared/money/formatCents";
import { ProtocolError, type EventData } from "../../../shared/realtime/protocol";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";

const GUEST_PATH = "/r/demo/t/qr-table-4";
const PAY_URL = "https://pay.stripe.test/session-1";
const FROZEN_BANNER = "Someone at your table is paying online.";
const PAY_ONLINE = `Pay online ${formatCents(2050)}`;

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

const realLocation = window.location;
let assign: ReturnType<typeof vi.fn>;

/** Every online payment start the guest page sent, with its auth header. */
const recordStarts = () => {
  const starts: (string | null)[] = [];
  server.events.on("request:start", ({ request }) => {
    if (request.method === "POST" && new URL(request.url).pathname.endsWith("/online-payment")) {
      starts.push(request.headers.get("authorization"));
    }
  });
  return starts;
};

/** A guest who scanned table 4's QR code and joined its open session. */
const renderGuest = () => {
  server.use(
    http.post("*/auth/table/:qrCode", () =>
      HttpResponse.json({ token: "guest-token", session: { _id: SESSION_ID, tableId: "table-4", tableNumber: 4 } })
    ),
    http.get("*/r/:slug/menu-items", () => HttpResponse.json([menuItem])),
    http.post(apiPaths.onlinePayment, () => HttpResponse.json({ url: PAY_URL, expiresAt: "2026-11-07T20:00:00.000Z" }))
  );
  const realtime = createMockRealtime();
  const user = userEvent.setup();
  render(
    <ContextProvider>
      <RealtimeTestProviders realtime={realtime} path={GUEST_PATH}>
        <Routes>
          <Route path="/r/:slug/t/:qrCode" element={<CustomerPage />} />
          <Route path="/receipt/:receiptToken" element={<ReceiptProbe />} />
        </Routes>
      </RealtimeTestProviders>
    </ContextProvider>
  );
  return { realtime, user };
};

const openBill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole("button", { name: /Open cart/ }));
  await user.click(screen.getByRole("button", { name: "Bill" }));
};

const addSoup = () => screen.findByRole("button", { name: "Add Tomato soup to cart" });

const frozen = (sessionId: string): EventData<"bill.frozen"> => ({ sessionId, expiresAt: "2026-11-07T20:00:00.000Z" });

/** An order no station has started on yet, so the guest may still cancel it. */
const pendingOrder = {
  ...unpaidBill.orders[0],
  status: "pending" as const,
  rev: 1,
  tickets: unpaidBill.orders[0].tickets.map((ticket) => ({ ...ticket, status: "pending" as const })),
};

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
  // `location.assign` cannot be spied on in jsdom, so the test swaps in a location that records it.
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
});

afterEach(() => {
  cleanup();
  Object.defineProperty(window, "location", { configurable: true, value: realLocation });
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("guest paying online", () => {
  it("offers to pay the bill total online next to paying through the staff", async () => {
    const { user } = renderGuest();
    await openBill(user);

    expect(await screen.findByRole("button", { name: PAY_ONLINE })).toBeEnabled();
    expect(screen.getByText(/ask the staff/i)).toBeInTheDocument();
  });

  it("shows the pay online button once the first order lands on an empty bill, without a reload", async () => {
    mockBillResponse(200, { ...unpaidBill, orders: [], totalCents: 0, canPayOnline: false });
    const { realtime, user } = renderGuest();
    await openBill(user);
    await screen.findByText("No orders yet");
    expect(screen.queryByRole("button", { name: /Pay online/ })).not.toBeInTheDocument();
    mockBillResponse(200, unpaidBill);

    realtime.emit("order.created", { order: unpaidBill.orders[0] });

    expect(await screen.findByRole("button", { name: PAY_ONLINE })).toBeEnabled();
  });

  it("pays the new total after the bill changes, not the one it had when the page opened", async () => {
    const { realtime, user } = renderGuest();
    await openBill(user);
    await screen.findByRole("button", { name: PAY_ONLINE });
    const [order] = unpaidBill.orders;
    mockBillResponse(200, { ...unpaidBill, totalCents: 1200 });

    realtime.emit("order.statusChanged", {
      orderId: order._id,
      status: order.status,
      rev: order.rev + 1,
      tickets: order.tickets,
      totalCents: 1200,
    });

    expect(await screen.findByRole("button", { name: `Pay online ${formatCents(1200)}` })).toBeEnabled();
  });

  it("shows no pay online button when the bill can't be paid online, and still the staff path", async () => {
    mockBillResponse(200, { ...unpaidBill, canPayOnline: false });
    const { user } = renderGuest();
    await openBill(user);

    expect(await screen.findByText(/ask the staff/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Pay online/ })).not.toBeInTheDocument();
  });

  it("sends one request with the guest token on a double tap and goes to the payment page", async () => {
    const starts = recordStarts();
    server.use(
      http.post(apiPaths.onlinePayment, async () => {
        await delay(50);
        return HttpResponse.json({ url: PAY_URL, expiresAt: "2026-11-07T20:00:00.000Z" });
      })
    );
    const { user } = renderGuest();
    await openBill(user);
    const button = await screen.findByRole("button", { name: PAY_ONLINE });

    await user.dblClick(button);

    expect(button).toBeDisabled();
    await waitFor(() => expect(assign).toHaveBeenCalledWith(PAY_URL));
    expect(starts).toEqual(["Bearer guest-token"]);
  });

  it("hides the button and explains when online payment became unavailable (409)", async () => {
    const { user } = renderGuest();
    await openBill(user);
    const button = await screen.findByRole("button", { name: PAY_ONLINE });
    mockStartOnlinePaymentResponse(onlinePaymentErrors.unavailable.status, onlinePaymentErrors.unavailable.body);
    mockBillResponse(200, { ...unpaidBill, canPayOnline: false });

    await user.click(button);

    expect(await screen.findByText(/Online payment isn't available for this bill right now\./)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("button", { name: /Pay online/ })).not.toBeInTheDocument());
    expect(assign).not.toHaveBeenCalled();
  });

  it("keeps the button and asks for the staff when the payment provider fails (502)", async () => {
    const { user } = renderGuest();
    await openBill(user);
    mockStartOnlinePaymentResponse(onlinePaymentErrors.providerError.status, onlinePaymentErrors.providerError.body);

    await user.click(await screen.findByRole("button", { name: PAY_ONLINE }));

    expect(await screen.findByText("Online payment isn't available right now, please ask the staff.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: PAY_ONLINE })).toBeEnabled();
    expect(assign).not.toHaveBeenCalled();
  });
});

describe("guest at a frozen bill", () => {
  it("shows the banner and locks ordering when the bill is already being paid on load", async () => {
    mockBillResponse(200, frozenBill);
    renderGuest();

    expect(await screen.findByText(FROZEN_BANNER)).toBeInTheDocument();
    await waitFor(async () => expect(await addSoup()).toBeDisabled());
  });

  it("freezes on bill.frozen for this session: banner, no ordering, no pay online button, no way to stop it", async () => {
    const { realtime, user } = renderGuest();
    await screen.findByText(/Tomato soup/);
    await waitFor(async () => expect(await addSoup()).toBeEnabled());

    realtime.emit("bill.frozen", frozen(SESSION_ID));

    const banner = (await screen.findByText(FROZEN_BANNER)).closest("[role=status]") as HTMLElement;
    expect(within(banner).getAllByRole("button").map((button) => button.textContent)).toEqual(["Continue to payment"]);
    expect(await addSoup()).toBeDisabled();
    await openBill(user);
    expect(screen.queryByRole("button", { name: /Pay online/ })).not.toBeInTheDocument();
  });

  it("ignores bill.frozen and bill.unfrozen for another session", async () => {
    const { realtime } = renderGuest();
    await waitFor(async () => expect(await addSoup()).toBeEnabled());

    realtime.emit("bill.frozen", frozen("session-other"));
    realtime.emit("bill.unfrozen", { sessionId: "session-other" });

    expect(screen.queryByText(FROZEN_BANNER)).not.toBeInTheDocument();
    expect(await addSoup()).toBeEnabled();
  });

  it("continues to the same payment page from the banner", async () => {
    const starts = recordStarts();
    mockBillResponse(200, frozenBill);
    const { user } = renderGuest();

    await user.click(await screen.findByRole("button", { name: "Continue to payment" }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith(PAY_URL));
    expect(starts).toEqual(["Bearer guest-token"]);
  });

  it("goes back to normal on bill.unfrozen, with the pay online button if the bill allows it again", async () => {
    mockBillResponse(200, frozenBill);
    const { realtime, user } = renderGuest();
    await screen.findByText(FROZEN_BANNER);
    mockBillResponse(200, unpaidBill);

    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID });

    await waitFor(() => expect(screen.queryByText(FROZEN_BANNER)).not.toBeInTheDocument());
    expect(await addSoup()).toBeEnabled();
    await openBill(user);
    expect(await screen.findByRole("button", { name: PAY_ONLINE })).toBeInTheDocument();
  });

  it("shows the frozen state when an order is refused with BILL_FROZEN", async () => {
    const { realtime, user } = renderGuest();
    await user.click(await addSoup());
    realtime.open();
    realtime.onRequest(() => {
      throw new ProtocolError("BILL_FROZEN", "Bill is frozen");
    });
    mockBillResponse(200, frozenBill);

    await user.click(screen.getByRole("button", { name: /Open cart/ }));
    await user.click(screen.getByRole("button", { name: "Order now" }));

    expect(await screen.findByText(FROZEN_BANNER)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry order" })).toBeDisabled();
  });

  it("takes away cancelling while frozen, and freezes when a cancel is refused with BILL_FROZEN", async () => {
    const { realtime, user } = renderGuest();
    await addSoup();
    realtime.open();
    realtime.emit("order.created", { order: pendingOrder });
    await openBill(user);
    await user.click(await screen.findByRole("button", { name: "Cancel order" }));
    realtime.onRequest(() => {
      throw new ProtocolError("BILL_FROZEN", "Bill is frozen");
    });
    mockBillResponse(200, frozenBill);

    const dialog = screen.getByRole("dialog", { name: "Cart" });
    await user.click(within(dialog).getAllByRole("button", { name: "Cancel order" })[0]);

    expect(await screen.findByText(FROZEN_BANNER)).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Cancel order" })).not.toBeInTheDocument();
  });

  it("still moves to the receipt when the bill is paid", async () => {
    mockBillResponse(200, frozenBill);
    const { realtime } = renderGuest();
    await screen.findByText(FROZEN_BANNER);

    realtime.emit("bill.paid", {
      sessionId: SESSION_ID,
      paymentId: "payment-1",
      receiptToken: "receipt-token-1",
      method: "ONLINE",
      totalCents: 2050,
    });

    expect(await screen.findByText("Receipt receipt-token-1")).toBeInTheDocument();
  });
});

const CARD_READER_BANNER = "Your bill is being paid on the card reader.";

const frozenOnReader: EventData<"bill.frozen"> = {
  sessionId: SESSION_ID,
  expiresAt: "2026-11-22T19:05:00.000Z",
  kind: "CARD_READER",
  readerName: "Bar",
  totalCents: 2050,
};

describe("guest while staff take the bill on a card reader", () => {
  it("shows the bill is being paid, without online payment, when it is already so on load", async () => {
    mockBillResponse(200, guestCardReaderPayingBill);
    const { user } = renderGuest();

    const banner = (await screen.findByText(CARD_READER_BANNER)).closest("[role=status]") as HTMLElement;
    expect(within(banner).queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText(FROZEN_BANNER)).not.toBeInTheDocument();
    await waitFor(async () => expect(await addSoup()).toBeDisabled());
    await openBill(user);
    const dialog = screen.getByRole("dialog", { name: "Cart" });
    expect(within(dialog).getByText("Being paid on the card reader")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /Pay online/ })).not.toBeInTheDocument();
  });

  it("switches to being paid on bill.frozen with the card reader kind, and back on bill.unfrozen", async () => {
    const { realtime, user } = renderGuest();
    await waitFor(async () => expect(await addSoup()).toBeEnabled());

    realtime.emit("bill.frozen", frozenOnReader);

    expect(await screen.findByText(CARD_READER_BANNER)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue to payment" })).not.toBeInTheDocument();
    await openBill(user);
    expect(screen.queryByRole("button", { name: /Pay online/ })).not.toBeInTheDocument();

    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID, reason: "FAILED" });

    await waitFor(() => expect(screen.queryByText(CARD_READER_BANNER)).not.toBeInTheDocument());
    expect(screen.queryByText("Being paid on the card reader")).not.toBeInTheDocument();
    expect(await screen.findByRole("button", { name: PAY_ONLINE })).toBeInTheDocument();
  });

  it("moves to the receipt when the card reader payment goes through", async () => {
    mockBillResponse(200, guestCardReaderPayingBill);
    const { realtime } = renderGuest();
    await screen.findByText(CARD_READER_BANNER);

    realtime.emit("bill.paid", {
      sessionId: SESSION_ID,
      paymentId: "payment-1",
      receiptToken: "receipt-token-1",
      method: "CARD_READER",
      totalCents: 2050,
    });

    expect(await screen.findByText("Receipt receipt-token-1")).toBeInTheDocument();
  });
});

describe("guest when a card reader payment ends unpaid", () => {
  it.each([
    ["CANCELLED", "The card payment was cancelled. You can order again."],
    ["EXPIRED", "The card payment timed out. You can order again."],
    ["STAFF_PAYMENT", "The card payment was stopped by staff."],
  ] as const)("leaves the card reader banner with a note on %s", async (reason, note) => {
    mockBillResponse(200, guestCardReaderPayingBill);
    const { realtime } = renderGuest();
    await screen.findByText(CARD_READER_BANNER);

    mockBillResponse(200, unpaidBill);
    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID, reason });

    expect(await screen.findByText(note)).toBeInTheDocument();
    expect(screen.queryByText(CARD_READER_BANNER)).not.toBeInTheDocument();
  });

  it("can order again after a cancel, and the note can be dismissed", async () => {
    mockBillResponse(200, guestCardReaderPayingBill);
    const { realtime, user } = renderGuest();
    await screen.findByText(CARD_READER_BANNER);
    await waitFor(async () => expect(await addSoup()).toBeDisabled());

    mockBillResponse(200, unpaidBill);
    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID, reason: "CANCELLED" });

    await waitFor(async () => expect(await addSoup()).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("The card payment was cancelled. You can order again.")).not.toBeInTheDocument();
  });

  it("says nothing when an online payment ends", async () => {
    const { realtime } = renderGuest();
    await waitFor(async () => expect(await addSoup()).toBeEnabled());
    realtime.emit("bill.frozen", frozen(SESSION_ID));
    await screen.findByText(FROZEN_BANNER);

    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID, reason: "CANCELLED" });

    await waitFor(() => expect(screen.queryByText(FROZEN_BANNER)).not.toBeInTheDocument());
    expect(screen.queryByText("The card payment was cancelled. You can order again.")).not.toBeInTheDocument();
  });
});
