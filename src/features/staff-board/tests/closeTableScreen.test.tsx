import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { useEffect, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import OrderDetails from "../../../Components/BarComponents/OrderDetails";
import { OrderProvider } from "../../../contexts/OrderContext";
import { useAuth } from "../../../contexts/AuthContext";
import { unpaidBill } from "../../../mocks/fixtures/bill";
import { paidBill } from "../../../mocks/fixtures/payments";
import { TABLE_ID } from "../../../mocks/fixtures/staffBoard";
import { mockBillResponse, mockCloseResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import { MenuProvider } from "../../guest-ordering/MenuProvider";
import { StaffBoardProvider } from "../StaffBoardProvider";

afterEach(() => clearTokens());

/** Signs in as someone with this role, the way `PrivateRoute` does after `/auth/user`. */
const SignedInAs = ({ role, children }: { role: string; children: ReactNode }) => {
  const { user, setUser } = useAuth();
  useEffect(() => setUser({ role }), [role, setUser]);
  return user ? <>{children}</> : null;
};

/** Records every `POST /sessions/:id/close` body the check sends. */
const recordCloses = (status = 204) => {
  const bodies: unknown[] = [];
  server.use(
    http.post("*/sessions/:sessionId/close", async ({ request }) => {
      bodies.push(await request.json().catch(() => null));
      return new HttpResponse(null, { status });
    })
  );
  return bodies;
};

const renderCheck = (role = "bar") => {
  saveTokens({ accessToken: "staff-token" });
  server.use(http.get("*/menu-items", () => HttpResponse.json([])));
  const realtime = createMockRealtime();
  const user = userEvent.setup();
  render(
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
  );
  return user;
};

const closeButton = () => screen.getByRole("button", { name: "Close table" });

describe("closing a table with an unpaid bill", () => {
  it("keeps Close table disabled and says why", async () => {
    const user = renderCheck();

    await screen.findByRole("button", { name: "Paid in cash" });
    expect(closeButton()).toBeDisabled();

    await user.hover(screen.getByTestId("close-table-hint"));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Record the payment first");
  });
});

describe("closing a table that may close", () => {
  it("closes a paid bill as before, without a reason", async () => {
    mockBillResponse(200, paidBill);
    const closes = recordCloses();
    const user = renderCheck();

    await screen.findByText(/Paid · Card ·/);
    await user.click(closeButton());
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Close table" }));

    await waitFor(() => expect(closes).toHaveLength(1));
    expect(closes[0]).toBeNull();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("closes a 0 € bill", async () => {
    mockBillResponse(200, { ...unpaidBill, orders: [], totalCents: 0 });
    const closes = recordCloses();
    const user = renderCheck();

    await waitFor(() => expect(closeButton()).toBeEnabled());
    await user.click(closeButton());
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Close table" }));

    await waitFor(() => expect(closes).toHaveLength(1));
  });
});

describe("closing without payment", () => {
  it("is not offered to bar or kitchen staff", async () => {
    renderCheck("kitchen");

    await screen.findByRole("button", { name: "Paid in cash" });
    expect(screen.queryByRole("button", { name: "Close without payment" })).not.toBeInTheDocument();
  });

  it("lets an owner close with a required reason", async () => {
    const closes = recordCloses();
    const user = renderCheck("owner");

    await user.click(await screen.findByRole("button", { name: "Close without payment" }));
    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: "Close without payment" });
    expect(confirm).toBeDisabled();

    await user.type(within(dialog).getByLabelText("Reason"), "Guests left without paying");
    await user.click(confirm);

    await waitFor(() => expect(closes).toEqual([{ unpaidReason: "Guests left without paying" }]));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("sends nothing when the owner dismisses the dialog", async () => {
    const closes = recordCloses();
    const user = renderCheck("admin");

    await user.click(await screen.findByRole("button", { name: "Close without payment" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Reason"), "Walked out");
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(closes).toEqual([]);
  });
});

describe("when the server says the bill is not paid", () => {
  it("says so and loads the bill again", async () => {
    let billLoads = 0;
    server.use(
      http.get("*/sessions/:sessionId/bill", () => {
        billLoads += 1;
        // A new order landed after the payment: the second look shows it unpaid.
        return HttpResponse.json(billLoads === 1 ? paidBill : unpaidBill);
      })
    );
    mockCloseResponse(409, { code: "BILL_UNPAID" });
    const user = renderCheck();

    await screen.findByText(/Paid · Card ·/);
    await user.click(closeButton());
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Close table" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("This bill isn't paid yet");
    expect(await screen.findByRole("button", { name: "Paid in cash" })).toBeInTheDocument();
    expect(billLoads).toBe(2);
    expect(closeButton()).toBeDisabled();
  });
});
