import { render, screen, waitFor } from "@testing-library/react";
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
import { SESSION_ID } from "../../../mocks/fixtures/bill";
import { TABLE_ID } from "../../../mocks/fixtures/staffBoard";
import { server } from "../../../mocks/server";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import type { EventData } from "../../../shared/realtime/protocol";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import { MenuProvider } from "../../guest-ordering/MenuProvider";
import { StaffBoardProvider } from "../StaffBoardProvider";

afterEach(() => clearTokens());

const CLOSE_CALL = "Close the waiter call at table 4";

const call: EventData<"waiter.called"> = {
  sessionId: SESSION_ID,
  tableId: TABLE_ID,
  tableNumber: 4,
  calledAt: "2026-11-07T19:10:00.000Z",
};

const SignedInAs = ({ role, children }: { role: string; children: ReactNode }) => {
  const { user, setUser } = useAuth();
  useEffect(() => setUser({ role }), [role, setUser]);
  return user ? <>{children}</> : null;
};

/** The staff floor and table 4's check, signed in so the board connects and loads. */
const renderStaff = (path = "/bar") => {
  saveTokens({ accessToken: "staff-token" });
  server.use(http.get("*/menu-items", () => HttpResponse.json([])));
  const realtime = createMockRealtime();
  const user = userEvent.setup();
  render(
    <ToastProvider>
      <RealtimeTestProviders realtime={realtime} path={path}>
        <SignedInAs role="bar">
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

const dismissals = (realtime: ReturnType<typeof createMockRealtime>) =>
  realtime.requests().filter((request) => request.type === "waiter.dismiss");

describe("a waiter call on the floor", () => {
  it("marks the calling table and tells the staff", async () => {
    const { realtime } = renderStaff();
    await screen.findByRole("button", { name: "Open table 4" });

    realtime.emit("waiter.called", call);

    expect(await screen.findByRole("button", { name: CLOSE_CALL })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open table 4" })).toHaveAccessibleDescription("Waiter called");
    expect(await screen.findByText("Table 4 is calling a waiter")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /waiter call at table 5/ })).not.toBeInTheDocument();
  });

  it("closes the call from the tile, and the mark goes when the server confirms", async () => {
    const { realtime, user } = renderStaff();
    await screen.findByRole("button", { name: "Open table 4" });
    realtime.emit("waiter.called", call);

    await user.click(await screen.findByRole("button", { name: CLOSE_CALL }));

    expect(dismissals(realtime).map((request) => request.payload)).toEqual([{ sessionId: SESSION_ID }]);
    realtime.emit("waiter.dismissed", { sessionId: SESSION_ID });
    await waitFor(() => expect(screen.queryByRole("button", { name: CLOSE_CALL })).not.toBeInTheDocument());
  });

  it("clears the mark when another waiter closes the call", async () => {
    const { realtime } = renderStaff();
    await screen.findByRole("button", { name: "Open table 4" });
    realtime.emit("waiter.called", call);
    await screen.findByRole("button", { name: CLOSE_CALL });

    realtime.emit("waiter.dismissed", { sessionId: SESSION_ID });

    await waitFor(() => expect(screen.queryByRole("button", { name: CLOSE_CALL })).not.toBeInTheDocument());
  });

  it("closes the call when staff open the calling table", async () => {
    const { realtime } = renderStaff(`/bar/table/${TABLE_ID}`);
    realtime.emit("waiter.called", call);

    await waitFor(() =>
      expect(dismissals(realtime).map((request) => request.payload)).toEqual([{ sessionId: SESSION_ID }])
    );
  });

  it("does not close anything when staff open a table nobody called from", async () => {
    const { realtime } = renderStaff(`/bar/table/${TABLE_ID}`);
    await screen.findByRole("heading", { name: /Table 4/ });

    expect(dismissals(realtime)).toEqual([]);
  });
});
