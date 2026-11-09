import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { useEffect, useState, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import OrderDetails from "../../../Components/BarComponents/OrderDetails";
import TableList from "../../../Components/BarComponents/TableList";
import ToastProvider from "../../../Components/ToastProvider";
import { OrderProvider } from "../../../contexts/OrderContext";
import { useAuth } from "../../../contexts/AuthContext";
import { SESSION_ID } from "../../../mocks/fixtures/bill";
import { paidBill, payment } from "../../../mocks/fixtures/payments";
import { TABLE_ID } from "../../../mocks/fixtures/staffBoard";
import { mockBillResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import type { EventData } from "../../../shared/realtime/protocol";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import { MenuProvider } from "../../guest-ordering/MenuProvider";
import { StaffBoardProvider } from "../StaffBoardProvider";

afterEach(() => clearTokens());

const SignedInAs = ({ role, children }: { role: string; children: ReactNode }) => {
  const { user, setUser } = useAuth();
  useEffect(() => setUser({ role }), [role, setUser]);
  return user ? <>{children}</> : null;
};

/** The staff screens can be taken off screen, to check they stop listening. */
const Leavable = ({ children }: { children: ReactNode }) => {
  const [shown, setShown] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setShown(false)}>
        Leave
      </button>
      {shown && children}
    </>
  );
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
          <Leavable>
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
          </Leavable>
        </SignedInAs>
      </RealtimeTestProviders>
    </ToastProvider>
  );
  return { realtime, user };
};

const billPaid: EventData<"bill.paid"> = {
  sessionId: SESSION_ID,
  paymentId: payment.id,
  receiptToken: payment.receiptToken,
  method: "CARD_TERMINAL",
  totalCents: payment.amountCents,
};

const SIGN_FAILED = "A payment signature failed — see Till & payments";

describe("staff screens when a bill is paid", () => {
  it("shows the table as paid on the floor without a reload", async () => {
    const { realtime } = renderStaff("bar", "/bar");
    const table = await screen.findByRole("button", { name: "Open table 4" });
    expect(within(table).getByText("Seated")).toBeInTheDocument();

    realtime.emit("bill.paid", billPaid);

    expect(within(table).getByText("Paid")).toBeInTheDocument();
  });

  it("switches the check's pay panel to paid when the bill is paid elsewhere", async () => {
    const { realtime } = renderStaff();
    await screen.findByRole("button", { name: "Paid in cash" });

    mockBillResponse(200, paidBill);
    realtime.emit("bill.paid", billPaid);

    expect(await screen.findByText(/Paid · Card ·/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Paid in cash" })).not.toBeInTheDocument();
  });

  it("clears the signature pending note once the payment is signed", async () => {
    mockBillResponse(200, paidBill);
    const { realtime } = renderStaff();
    expect(await screen.findByText("Signature pending")).toBeInTheDocument();
    realtime.emit("bill.paid", billPaid);

    mockBillResponse(200, { ...paidBill, payment: { ...payment, signature: { status: "SIGNED" } } });
    realtime.emit("payment.signed", { paymentId: payment.id, receiptToken: payment.receiptToken });

    await waitFor(() => expect(screen.queryByText("Signature pending")).not.toBeInTheDocument());
    expect(screen.getByText(/Paid · Card ·/)).toBeInTheDocument();
  });
});

describe("a payment signature that failed", () => {
  it.each(["owner", "admin"])("tells an %s, with a link to Till & payments", async (role) => {
    const { realtime } = renderStaff(role);
    await screen.findByRole("button", { name: "Paid in cash" });

    realtime.emit("payment.signFailed", { paymentId: payment.id });

    expect(await screen.findByRole("link", { name: SIGN_FAILED })).toHaveAttribute("href", "/admin/kasse");
  });

  it("says nothing to bar staff", async () => {
    const { realtime } = renderStaff("bar");
    await screen.findByRole("button", { name: "Paid in cash" });

    realtime.emit("payment.signFailed", { paymentId: payment.id });

    expect(screen.queryByText(SIGN_FAILED)).not.toBeInTheDocument();
  });

  it("stops listening once the staff screens are gone", async () => {
    const { realtime, user } = renderStaff("owner");
    await screen.findByRole("button", { name: "Paid in cash" });

    await user.click(screen.getByRole("button", { name: "Leave" }));
    realtime.emit("payment.signFailed", { paymentId: payment.id });

    expect(screen.queryByText(SIGN_FAILED)).not.toBeInTheDocument();
  });
});
