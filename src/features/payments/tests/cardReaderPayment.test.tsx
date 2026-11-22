import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { useEffect, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import OrderDetails from "../../../Components/BarComponents/OrderDetails";
import ToastProvider from "../../../Components/ToastProvider";
import { OrderProvider } from "../../../contexts/OrderContext";
import { useAuth } from "../../../contexts/AuthContext";
import { SESSION_ID, unpaidBill } from "../../../mocks/fixtures/bill";
import { cardReaderBill, cardReaderPayingBill, cardReaders } from "../../../mocks/fixtures/cardReaders";
import { paidBill, payment } from "../../../mocks/fixtures/payments";
import { TABLE_ID } from "../../../mocks/fixtures/staffBoard";
import { apiPaths } from "../../../mocks/handlers/paths";
import { mockBillResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import { formatCents } from "../../../shared/money/formatCents";
import type { EventData } from "../../../shared/realtime/protocol";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import { MenuProvider } from "../../guest-ordering/MenuProvider";
import { StaffBoardProvider } from "../../staff-board/StaffBoardProvider";

afterEach(() => clearTokens());

const SignedInAs = ({ role, children }: { role: string; children: ReactNode }) => {
  const { user, setUser } = useAuth();
  useEffect(() => setUser({ role }), [role, setUser]);
  return user ? <>{children}</> : null;
};

/** Table 4's check on the staff screen, signed in so the board connects and loads. */
const renderStaffCheck = (role = "bar") => {
  saveTokens({ accessToken: "staff-token" });
  server.use(http.get("*/menu-items", () => HttpResponse.json([])));
  const realtime = createMockRealtime();
  const user = userEvent.setup();
  render(
    <ToastProvider>
      <RealtimeTestProviders realtime={realtime} path={`/bar/table/${TABLE_ID}`}>
        <SignedInAs role={role}>
          <MenuProvider>
            <StaffBoardProvider>
              <Routes>
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
