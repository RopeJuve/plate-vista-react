import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { useEffect, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import OrderDetails from "../../../Components/BarComponents/OrderDetails";
import TableList from "../../../Components/BarComponents/TableList";
import ToastProvider from "../../../Components/ToastProvider";
import { OrderProvider } from "../../../contexts/OrderContext";
import { useAuth } from "../../../contexts/AuthContext";
import { frozenBill, SESSION_ID } from "../../../mocks/fixtures/bill";
import { onlinePaymentErrors } from "../../../mocks/fixtures/onlinePayments";
import { paidBill, payment } from "../../../mocks/fixtures/payments";
import { staffBoard, TABLE_ID } from "../../../mocks/fixtures/staffBoard";
import { apiPaths } from "../../../mocks/handlers/paths";
import {
  mockBillResponse,
  mockCancelOnlinePaymentResponse,
  mockCloseResponse,
  mockPayResponse,
  mockStaffBoardResponse,
} from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import type { EventData, StaffBoard } from "../../../shared/realtime/protocol";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import { MenuProvider } from "../../guest-ordering/MenuProvider";
import TableDetailsDialog from "../../tables/TableDetailsDialog";
import { StaffBoardProvider } from "../StaffBoardProvider";

afterEach(() => clearTokens());

const PAID_ONLINE = /The guest has just paid online/;
const UNFREEZE_TITLE = "Unfreeze the bill?";
const WARNING = "A guest is paying online right now. Recording this payment cancels their online payment.";

const payingBoard: StaffBoard = {
  ...staffBoard,
  sessions: staffBoard.sessions.map((session) => ({ ...session, status: "paying" })),
};

const SignedInAs = ({ role, children }: { role: string; children: ReactNode }) => {
  const { user, setUser } = useAuth();
  useEffect(() => setUser({ role }), [role, setUser]);
  return user ? <>{children}</> : null;
};

/** The staff floor and table 4's check, signed in so the board connects and loads. */
const renderStaff = (role = "bar", path = `/bar/table/${TABLE_ID}`) => {
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

/** A frozen bill on the board and from `GET /sessions/:id/bill`. */
const freeze = () => {
  mockStaffBoardResponse(200, payingBoard);
  mockBillResponse(200, frozenBill);
};

/** Counts every `POST /sessions/:id/online-payment/cancel`. */
const recordCancels = () => {
  const cancels: string[] = [];
  server.use(
    http.post(apiPaths.cancelOnlinePayment, ({ params }) => {
      cancels.push(String(params.sessionId));
      return new HttpResponse(null, { status: 200 });
    })
  );
  return cancels;
};

const paidOnline: EventData<"bill.paid"> = {
  sessionId: SESSION_ID,
  paymentId: payment.id,
  receiptToken: payment.receiptToken,
  method: "ONLINE",
  totalCents: payment.amountCents,
};

describe("the floor while a guest pays online", () => {
  it("shows the badge for a session the board loads as paying", async () => {
    mockStaffBoardResponse(200, payingBoard);
    renderStaff("bar", "/bar");

    const table = await screen.findByRole("button", { name: "Open table 4" });
    expect(await within(table).findByText("Paying online")).toBeInTheDocument();
  });

  it("adds the badge on bill.frozen and removes it on bill.unfrozen", async () => {
    const { realtime } = renderStaff("bar", "/bar");
    const table = await screen.findByRole("button", { name: "Open table 4" });
    expect(within(table).queryByText("Paying online")).not.toBeInTheDocument();

    realtime.emit("bill.frozen", { sessionId: SESSION_ID, expiresAt: "2026-11-17T22:00:00.000Z" });
    expect(within(table).getByText("Paying online")).toBeInTheDocument();

    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID });
    expect(within(table).queryByText("Paying online")).not.toBeInTheDocument();
  });

  it("swaps the badge for Paid on bill.paid", async () => {
    mockStaffBoardResponse(200, payingBoard);
    const { realtime } = renderStaff("bar", "/bar");
    const table = await screen.findByRole("button", { name: "Open table 4" });
    await within(table).findByText("Paying online");

    realtime.emit("bill.paid", paidOnline);

    expect(within(table).queryByText("Paying online")).not.toBeInTheDocument();
    expect(within(table).getByText("Paid")).toBeInTheDocument();
  });
});

describe("a table's check while a guest pays online", () => {
  it("shows the badge once bill.frozen arrives, and Paid · Online after bill.paid", async () => {
    const { realtime } = renderStaff();
    await screen.findByRole("button", { name: "Paid in cash" });

    mockBillResponse(200, frozenBill);
    realtime.emit("bill.frozen", { sessionId: SESSION_ID, expiresAt: "2026-11-17T22:00:00.000Z" });
    expect(await screen.findByText("Paying online")).toBeInTheDocument();

    mockBillResponse(200, { ...paidBill, payment: { ...payment, method: "ONLINE" } });
    realtime.emit("bill.paid", paidOnline);
    expect(await screen.findByText(/Paid · Online ·/)).toBeInTheDocument();
    expect(screen.queryByText("Paying online")).not.toBeInTheDocument();
  });

  it("hides Unfreeze from bar staff", async () => {
    freeze();
    renderStaff("bar");

    expect(await screen.findByText("Paying online")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Unfreeze bill" })).not.toBeInTheDocument();
  });

  it.each(["owner", "admin"])("lets an %s unfreeze the bill with one cancel call after confirming", async (role) => {
    freeze();
    const cancels = recordCancels();
    const { user } = renderStaff(role);

    await user.click(await screen.findByRole("button", { name: "Unfreeze bill" }));
    const dialog = await screen.findByRole("dialog", { name: UNFREEZE_TITLE });
    expect(
      within(dialog).getByText("The guest's online payment will be cancelled and the table can order again.")
    ).toBeInTheDocument();
    expect(cancels).toEqual([]);

    mockBillResponse(200, { ...frozenBill, session: { ...frozenBill.session, status: "open" } });
    await user.click(within(dialog).getByRole("button", { name: "Unfreeze bill" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(cancels).toEqual([SESSION_ID]);
    await waitFor(() => expect(screen.queryByText("Paying online")).not.toBeInTheDocument());
  });

  it("says the guest has just paid when unfreezing comes too late", async () => {
    freeze();
    const { billPayingOnline } = onlinePaymentErrors;
    mockCancelOnlinePaymentResponse(billPayingOnline.status, billPayingOnline.body);
    const { user } = renderStaff("owner");

    await user.click(await screen.findByRole("button", { name: "Unfreeze bill" }));
    await user.click(
      within(await screen.findByRole("dialog", { name: UNFREEZE_TITLE })).getByRole("button", { name: "Unfreeze bill" })
    );

    expect(await screen.findByText(PAID_ONLINE)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("warns before recording cash on a frozen bill, then records it as usual", async () => {
    freeze();
    const { user } = renderStaff("bar");

    await user.click(await screen.findByRole("button", { name: "Paid in cash" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(WARNING)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Confirm payment" }));

    expect(await screen.findByText(/Paid · Cash ·/)).toBeInTheDocument();
  });

  it("shows no warning on a bill nobody is paying online", async () => {
    const { user } = renderStaff("bar");

    await user.click(await screen.findByRole("button", { name: "Paid in cash" }));
    expect(within(await screen.findByRole("dialog")).queryByText(WARNING)).not.toBeInTheDocument();
  });

  it("says the guest has just paid when cash comes too late, without a retry", async () => {
    freeze();
    const { billPayingOnline } = onlinePaymentErrors;
    mockPayResponse(billPayingOnline.status, billPayingOnline.body);
    const { realtime, user } = renderStaff("bar");

    await user.click(await screen.findByRole("button", { name: "Paid in cash" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Confirm payment" }));

    expect(await screen.findByText(PAID_ONLINE)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.queryByText(/Confirm again to retry/)).not.toBeInTheDocument();

    mockBillResponse(200, { ...paidBill, payment: { ...payment, method: "ONLINE" } });
    realtime.emit("bill.paid", paidOnline);
    expect(await screen.findByText(/Paid · Online ·/)).toBeInTheDocument();
  });

  it("says the guest has just paid when closing comes too late", async () => {
    freeze();
    const { billPayingOnline } = onlinePaymentErrors;
    mockCloseResponse(billPayingOnline.status, billPayingOnline.body);
    const { user } = renderStaff("owner");

    await user.click(await screen.findByRole("button", { name: "Close without payment" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Reason"), "Guests left");
    await user.click(within(dialog).getByRole("button", { name: "Close without payment" }));

    expect(await screen.findByText(PAID_ONLINE)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("the admin table dialog while a guest pays online", () => {
  const renderAdminDialog = () => {
    const realtime = createMockRealtime();
    const user = userEvent.setup();
    render(
      <RealtimeTestProviders realtime={realtime}>
        <TableDetailsDialog table={{ _id: TABLE_ID, tableNumber: 4 }} open onOpenChange={() => undefined} />
      </RealtimeTestProviders>
    );
    return { user, realtime };
  };

  it("adds and removes the badge as the live events arrive", async () => {
    mockBillResponse(200, { ...frozenBill, session: { ...frozenBill.session, status: "open" } });
    const { realtime } = renderAdminDialog();
    await screen.findByRole("button", { name: "Paid in cash" });
    expect(screen.queryByText("Paying online")).not.toBeInTheDocument();

    mockBillResponse(200, frozenBill);
    realtime.emit("bill.frozen", { sessionId: SESSION_ID, expiresAt: "2026-11-17T22:00:00.000Z" });
    expect(await screen.findByText("Paying online")).toBeInTheDocument();

    mockBillResponse(200, { ...frozenBill, session: { ...frozenBill.session, status: "open" } });
    realtime.emit("bill.unfrozen", { sessionId: SESSION_ID });
    await waitFor(() => expect(screen.queryByText("Paying online")).not.toBeInTheDocument());
  });

  it("shows the badge and lets the owner unfreeze the bill", async () => {
    mockBillResponse(200, frozenBill);
    const cancels = recordCancels();
    const { user } = renderAdminDialog();

    expect(await screen.findByText("Paying online")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Unfreeze bill" }));
    const confirm = await screen.findByRole("dialog", { name: UNFREEZE_TITLE });
    mockBillResponse(200, { ...frozenBill, session: { ...frozenBill.session, status: "open" } });
    await user.click(within(confirm).getByRole("button", { name: "Unfreeze bill" }));

    await waitFor(() => expect(cancels).toEqual([SESSION_ID]));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: UNFREEZE_TITLE })).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText("Paying online")).not.toBeInTheDocument());
  });
});
