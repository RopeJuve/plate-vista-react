import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { useEffect, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import OrderDetails from "../../../Components/BarComponents/OrderDetails";
import TableList from "../../../Components/BarComponents/TableList";
import ToastProvider from "../../../Components/ToastProvider";
import { OrderProvider } from "../../../contexts/OrderContext";
import { useAuth } from "../../../contexts/AuthContext";
import { SESSION_ID, unpaidBill } from "../../../mocks/fixtures/bill";
import {
  cardReaderBill,
  cardReaderPaymentErrors,
  cardReaderPayingBill,
  cardReaders,
  idleSimulatedReader,
} from "../../../mocks/fixtures/cardReaders";
import { paidBill, payment } from "../../../mocks/fixtures/payments";
import { TABLE_ID } from "../../../mocks/fixtures/staffBoard";
import { apiPaths } from "../../../mocks/handlers/paths";
import {
  mockBillResponse,
  mockCancelCardReaderPaymentResponse,
  mockStartCardReaderPaymentResponse,
} from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import { formatCents } from "../../../shared/money/formatCents";
import type { EventData } from "../../../shared/realtime/protocol";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import { MenuProvider } from "../../guest-ordering/MenuProvider";
import { StaffBoardProvider } from "../../staff-board/StaffBoardProvider";
import TableDetailsDialog from "../../tables/TableDetailsDialog";

afterEach(() => {
  clearTokens();
  server.events.removeAllListeners();
});

const SignedInAs = ({ role, children }: { role: string; children: ReactNode }) => {
  const { user, setUser } = useAuth();
  useEffect(() => setUser({ role }), [role, setUser]);
  return user ? <>{children}</> : null;
};

/** Table 4's check (or, at `/bar`, the floor) on the staff screen, signed in so the board connects and loads. */
const renderStaffCheck = (role = "bar", path = `/bar/table/${TABLE_ID}`) => {
  saveTokens({ accessToken: "staff-token" });
  server.use(http.get("*/menu-items", () => HttpResponse.json([])));
  const realtime = createMockRealtime();
  const user = userEvent.setup();
  render(
    <ToastProvider>
      <RealtimeTestProviders realtime={realtime} path={path}>
        <SignedInAs role={role}>
          <MenuProvider>
            <StaffBoardProvider>
              <Routes>
                <Route path="/bar" element={<TableList />} />
                <Route
                  path="/bar/table/:tableId"
                  element={
                    <OrderProvider>
                      <OrderDetails />
                    </OrderProvider>
                  }
                />
              </Routes>
            </StaffBoardProvider>
          </MenuProvider>
        </SignedInAs>
      </RealtimeTestProviders>
    </ToastProvider>
  );
  return { realtime, user };
};

const CARD_READER = "Card reader";

/** A total as the screen shows it, its no-break space read as a plain one. */
const shown = (cents: number) => formatCents(cents).replace(/\s/g, " ");

describe("the card reader option on the pay panel", () => {
  it("is offered next to cash and card when the API offers it", async () => {
    mockBillResponse(200, cardReaderBill());
    renderStaffCheck();

    expect(await screen.findByRole("button", { name: CARD_READER })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Paid in cash" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Paid by card" })).toBeInTheDocument();
  });

  it("is not there when the API hides it, or says nothing about card readers", async () => {
    mockBillResponse(200, { ...cardReaderBill(), cardReader: { state: "HIDDEN", reason: null, readers: [] } });
    renderStaffCheck();

    await screen.findByRole("button", { name: "Paid in cash" });
    expect(screen.queryByRole("button", { name: CARD_READER })).not.toBeInTheDocument();
  });

  it("is not there on a bill without card reader fields", async () => {
    mockBillResponse(200, unpaidBill);
    renderStaffCheck();

    await screen.findByRole("button", { name: "Paid in cash" });
    expect(screen.queryByRole("button", { name: CARD_READER })).not.toBeInTheDocument();
  });

  it("is greyed out with the reason when no reader is available", async () => {
    mockBillResponse(200, {
      ...cardReaderBill(),
      cardReader: { state: "DISABLED", reason: "NO_READER_AVAILABLE", readers: [] },
    });
    renderStaffCheck();

    expect(await screen.findByRole("button", { name: CARD_READER })).toBeDisabled();
    expect(screen.getByText("Every card reader is offline or busy.")).toBeInTheDocument();
  });
});

/** Every `POST /sessions/:id/card-reader-payment` body, answered after a short wait so a double tap overlaps. */
const recordStarts = () => {
  const starts: unknown[] = [];
  server.use(
    http.post(apiPaths.cardReaderPayment, async ({ request }) => {
      starts.push(await request.json());
      await delay(50);
      return HttpResponse.json(cardReaderPayingBill().cardReaderPayment);
    })
  );
  return starts;
};

describe("starting a card reader payment", () => {
  it("shows the reader's name, the bill total and that it waits for the card, after one request on a double tap", async () => {
    mockBillResponse(200, cardReaderBill());
    const starts = recordStarts();
    const { user } = renderStaffCheck();

    await user.dblClick(await screen.findByRole("button", { name: CARD_READER }));

    const status = await screen.findByRole("region", { name: "Card reader payment" });
    expect(within(status).getByText("Bar")).toBeInTheDocument();
    expect(within(status).getByText(shown(unpaidBill.totalCents))).toBeInTheDocument();
    expect(within(status).getByText("Waiting for card")).toBeInTheDocument();
    expect(starts).toEqual([{ readerId: cardReaders.bar.id, expectedTotalCents: unpaidBill.totalCents }]);
  });

  it("shows the payment in progress when the check opens on a bill a reader is taking", async () => {
    mockBillResponse(200, cardReaderPayingBill());
    renderStaffCheck();

    const status = await screen.findByRole("region", { name: "Card reader payment" });
    expect(within(status).getByText("Waiting for card")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: CARD_READER })).not.toBeInTheDocument();
    expect(screen.queryByText("Paying online")).not.toBeInTheDocument();
  });

  it("has no test card button on a real reader", async () => {
    mockBillResponse(200, cardReaderPayingBill());
    renderStaffCheck();

    await screen.findByText("Waiting for card");
    expect(screen.queryByRole("button", { name: "Present test card" })).not.toBeInTheDocument();
  });

  it("presents an approved test card on a Simulated Reader", async () => {
    mockBillResponse(200, cardReaderPayingBill(idleSimulatedReader));
    const cards: unknown[] = [];
    server.use(
      http.post(apiPaths.cardReaderTestCard, async ({ request }) => {
        cards.push(await request.json());
        return HttpResponse.json(cardReaderPayingBill(idleSimulatedReader).cardReaderPayment);
      })
    );
    const { user } = renderStaffCheck();

    await user.click(await screen.findByRole("button", { name: "Present test card" }));

    await waitFor(() => expect(cards).toEqual([{ card: "APPROVED" }]));
    expect(screen.getByText("Waiting for card")).toBeInTheDocument();
  });
});

const paidOnReader: EventData<"bill.paid"> = {
  sessionId: SESSION_ID,
  paymentId: payment.id,
  receiptToken: payment.receiptToken,
  method: "CARD_READER",
  totalCents: payment.amountCents,
};

describe("a card reader payment that goes through", () => {
  it("moves the panel to Paid on the paid event", async () => {
    mockBillResponse(200, cardReaderBill(idleSimulatedReader));
    const { realtime, user } = renderStaffCheck();
    await user.click(await screen.findByRole("button", { name: CARD_READER }));
    await screen.findByText("Waiting for card");

    mockBillResponse(200, { ...paidBill, payment: { ...payment, method: "CARD_READER" } });
    realtime.emit("bill.paid", paidOnReader);

    expect(await screen.findByText(/Paid · Card ·/)).toBeInTheDocument();
    expect(screen.queryByText("Waiting for card")).not.toBeInTheDocument();
  });

  it("shows the payment on another device at the table from bill.frozen, then Paid from bill.paid", async () => {
    mockBillResponse(200, cardReaderBill());
    const { realtime } = renderStaffCheck();
    await screen.findByRole("button", { name: CARD_READER });

    mockBillResponse(200, cardReaderPayingBill());
    realtime.emit("bill.frozen", {
      sessionId: SESSION_ID,
      expiresAt: "2026-11-22T19:05:00.000Z",
      kind: "CARD_READER",
      readerName: "Bar",
      totalCents: unpaidBill.totalCents,
    });
    expect(await screen.findByText("Waiting for card")).toBeInTheDocument();

    mockBillResponse(200, { ...paidBill, payment: { ...payment, method: "CARD_READER" } });
    realtime.emit("bill.paid", paidOnReader);
    expect(await screen.findByText(/Paid · Card ·/)).toBeInTheDocument();
  });
});

describe("a card reader payment that cannot start", () => {
  it.each([
    ["billPaid", "Already paid."],
    ["billEmpty", "Nothing to pay — close the table instead."],
    ["billChanged", `The bill changed — new total ${shown(2750)}. Please start again.`],
    ["onlineInProgress", "A guest is paying this bill online right now."],
    ["readerInProgress", "This bill is already being paid on the card reader “Terrasse”."],
    ["busy", "The card reader is taking table 7’s payment."],
    ["offline", "The card reader is offline. Check it is switched on and connected."],
    ["tseNotActive", "Card reader payments need an active TSE."],
    ["payoutNotReady", "Card reader payments need a payout account that can take payments."],
    ["providerError", "The card reader could not be reached through Stripe. Try again."],
    ["stripeNotConfigured", "Card reader payments are not set up on the server."],
  ] as const)("says so readably on %s", async (name, message) => {
    mockBillResponse(200, cardReaderBill());
    const { status, body } = cardReaderPaymentErrors[name];
    mockStartCardReaderPaymentResponse(status, body);
    const { user } = renderStaffCheck();

    await user.click(await screen.findByRole("button", { name: CARD_READER }));

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.queryByText("Waiting for card")).not.toBeInTheDocument();
  });

  it("asks to try again when the server can't be reached", async () => {
    mockBillResponse(200, cardReaderBill());
    server.use(http.post(apiPaths.cardReaderPayment, () => HttpResponse.error()));
    const { user } = renderStaffCheck();

    await user.click(await screen.findByRole("button", { name: CARD_READER }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not reach the server. Try again.");
    expect(screen.getByRole("button", { name: CARD_READER })).toBeEnabled();
  });
});

describe("the floor while a card reader takes a table's payment", () => {
  it("marks the table paying by card from bill.frozen, not online, then Paid from bill.paid", async () => {
    const { realtime } = renderStaffCheck("bar", "/bar");
    const table = await screen.findByRole("button", { name: "Open table 4" });

    realtime.emit("bill.frozen", {
      sessionId: SESSION_ID,
      expiresAt: "2026-11-22T19:05:00.000Z",
      kind: "CARD_READER",
      readerName: "Bar",
      totalCents: unpaidBill.totalCents,
    });
    expect(within(table).getByText("Paying by card")).toBeInTheDocument();
    expect(within(table).queryByText("Paying online")).not.toBeInTheDocument();

    realtime.emit("bill.paid", paidOnReader);
    expect(within(table).queryByText("Paying by card")).not.toBeInTheDocument();
    expect(within(table).getByText("Paid")).toBeInTheDocument();
  });
});

/** Every `POST /sessions/:id/card-reader-payment/cancel`, answered after a short wait so a double tap overlaps. */
const recordCancels = () => {
  const cancels: string[] = [];
  server.use(
    http.post(apiPaths.cancelCardReaderPayment, async ({ params }) => {
      cancels.push(String(params.sessionId));
      await delay(50);
      return HttpResponse.json({ status: "open" });
    })
  );
  return cancels;
};

const frozenOnReader: EventData<"bill.frozen"> = {
  sessionId: SESSION_ID,
  expiresAt: "2026-11-22T19:05:00.000Z",
  kind: "CARD_READER",
  readerName: "Bar",
  totalCents: unpaidBill.totalCents,
};

/** How many times the bill was read so far. */
const countBillReads = () => {
  let reads = 0;
  server.events.on("request:end", ({ request }) => {
    if (request.method === "GET" && /\/sessions\/[^/]+\/bill$/.test(new URL(request.url).pathname)) {
      reads += 1;
    }
  });
  return () => reads;
};

/**
 * The check open on a bill the Bar reader is taking, with the board told so by `bill.frozen`
 * and the bill read again after it, so later answers are the test's own.
 */
const renderCheckOnReader = async () => {
  mockBillResponse(200, cardReaderPayingBill());
  const billReads = countBillReads();
  const screenParts = renderStaffCheck();
  await screen.findByText("Waiting for card");
  const readsBefore = billReads();
  screenParts.realtime.emit("bill.frozen", frozenOnReader);
  await waitFor(() => expect(billReads()).toBeGreaterThan(readsBefore));
  await screen.findByText("Waiting for card");
  return screenParts;
};

describe("cancelling a card reader payment", () => {
  it("is offered only while waiting for the card", async () => {
    mockBillResponse(200, cardReaderBill());
    const { user } = renderStaffCheck();
    await screen.findByRole("button", { name: CARD_READER });
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: CARD_READER }));

    const status = await screen.findByRole("region", { name: "Card reader payment" });
    expect(within(status).getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("sends one request on a double tap and goes back to the payment choice", async () => {
    const cancels = recordCancels();
    const { user } = await renderCheckOnReader();

    mockBillResponse(200, cardReaderBill());
    await user.dblClick(screen.getByRole("button", { name: "Cancel" }));

    expect(await screen.findByRole("button", { name: CARD_READER })).toBeEnabled();
    expect(screen.queryByText("Waiting for card")).not.toBeInTheDocument();
    expect(screen.getByText("To pay")).toBeInTheDocument();
    expect(cancels).toEqual([SESSION_ID]);
  });

  it("lets the table order again once the bill unfreezes", async () => {
    const { realtime } = renderStaffCheck("bar", "/bar");
    const table = await screen.findByRole("button", { name: "Open table 4" });
    realtime.emit("bill.frozen", frozenOnReader);
    expect(within(table).getByText("Paying by card")).toBeInTheDocument();

    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID, reason: "CANCELLED" });

    expect(within(table).queryByText("Paying by card")).not.toBeInTheDocument();
  });

  it("says the card already went through when the cancel comes too late", async () => {
    mockCancelCardReaderPaymentResponse(409, { code: "BILL_PAID", message: "The bill is already paid." });
    const { user } = await renderCheckOnReader();

    mockBillResponse(200, { ...paidBill, payment: { ...payment, method: "CARD_READER" } });
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The card already went through, so the bill is paid.");
    expect(await screen.findByText(/Paid · Card ·/)).toBeInTheDocument();
  });

  it("asks to try again when the server can't be reached, still waiting for the card", async () => {
    server.use(http.post(apiPaths.cancelCardReaderPayment, () => HttpResponse.error()));
    const { user } = await renderCheckOnReader();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not reach the server. Try again.");
    expect(screen.getByText("Waiting for card")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });
});

describe("a card reader payment that ends without being paid", () => {
  it.each([
    ["CANCELLED", "The card reader payment was cancelled."],
    ["EXPIRED", "The card reader payment timed out: no card was presented."],
    ["STAFF_PAYMENT", "The card reader payment was stopped: staff recorded a payment or closed the table."],
  ] as const)("leaves the card reader screen on every device with a note on %s", async (reason, note) => {
    const { realtime } = await renderCheckOnReader();

    mockBillResponse(200, cardReaderBill());
    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID, reason });

    expect(await screen.findByText(note)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Waiting for card")).not.toBeInTheDocument());
    expect(await screen.findByRole("button", { name: CARD_READER })).toBeEnabled();
  });

  it("notes nothing when an online payment unfreezes", async () => {
    mockBillResponse(200, cardReaderBill());
    const { realtime } = renderStaffCheck();
    await screen.findByRole("button", { name: CARD_READER });

    realtime.emit("bill.frozen", { sessionId: SESSION_ID, expiresAt: "2026-11-22T19:30:00.000Z", kind: "ONLINE" });
    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID, reason: "CANCELLED" });

    await screen.findByRole("button", { name: CARD_READER });
    expect(screen.queryByText("The card reader payment was cancelled.")).not.toBeInTheDocument();
  });

  it("drops the note when the next card reader payment starts", async () => {
    const { realtime } = await renderCheckOnReader();
    mockBillResponse(200, cardReaderBill());
    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID, reason: "EXPIRED" });
    await screen.findByText("The card reader payment timed out: no card was presented.");

    mockBillResponse(200, cardReaderPayingBill());
    realtime.emit("bill.frozen", frozenOnReader);

    expect(await screen.findByText("Waiting for card")).toBeInTheDocument();
    expect(screen.queryByText("The card reader payment timed out: no card was presented.")).not.toBeInTheDocument();
  });
});

describe("the admin table dialog when a card reader payment ends", () => {
  it("leaves the card reader screen with a note on bill.unfrozen", async () => {
    mockBillResponse(200, cardReaderPayingBill());
    const realtime = createMockRealtime();
    render(
      <RealtimeTestProviders realtime={realtime}>
        <TableDetailsDialog table={{ _id: TABLE_ID, tableNumber: 4 }} open onOpenChange={() => undefined} />
      </RealtimeTestProviders>
    );
    await screen.findByText("Waiting for card");

    mockBillResponse(200, cardReaderBill());
    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID, reason: "EXPIRED" });

    expect(await screen.findByText("The card reader payment timed out: no card was presented.")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Waiting for card")).not.toBeInTheDocument());
  });
});

describe("recording cash or card during a card reader payment", () => {
  it.each([
    ["Paid in cash", "CASH"],
    ["Paid by card", "CARD_TERMINAL"],
  ] as const)("%s is still possible and says it stops the card reader", async (button, method) => {
    const bodies: unknown[] = [];
    server.use(
      http.post(apiPaths.pay, async ({ request }) => {
        const body = (await request.json()) as { method: string };
        bodies.push(body.method);
        return HttpResponse.json({ ...payment, method: body.method }, { status: 201 });
      })
    );
    const { user } = await renderCheckOnReader();

    await user.click(screen.getByRole("button", { name: button }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Recording this payment stops the card reader payment\./)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Confirm payment" }));

    expect(await screen.findByText(/^Paid · /)).toBeInTheDocument();
    expect(screen.queryByText("Waiting for card")).not.toBeInTheDocument();
    expect(bodies).toEqual([method]);
  });
});
