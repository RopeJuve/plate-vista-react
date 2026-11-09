import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import OrderDetails from "../../../Components/BarComponents/OrderDetails";
import { OrderProvider } from "../../../contexts/OrderContext";
import { TABLE_ID } from "../../../mocks/fixtures/staffBoard";
import { server } from "../../../mocks/server";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import { MenuProvider } from "../../guest-ordering/MenuProvider";
import { StaffBoardProvider } from "../../staff-board/StaffBoardProvider";
import TableDetailsDialog from "../../tables/TableDetailsDialog";

const renderAdminDialog = (tableId: string, tableNumber: number) => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <TableDetailsDialog table={{ _id: tableId, tableNumber }} open onOpenChange={() => undefined} />
    </MemoryRouter>
  );
  return user;
};

describe("paying from the admin table dialog", () => {
  it("records a payment for the table's open bill", async () => {
    const user = renderAdminDialog(TABLE_ID, 4);

    await user.click(await screen.findByRole("button", { name: "Paid in cash" }));
    const confirm = await screen.findByRole("button", { name: "Confirm payment" });
    await user.click(confirm);

    expect(await screen.findByText(/Paid · Cash ·/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Show receipt" })).toBeInTheDocument();
  });

  it("says so when the table has no open bill", async () => {
    renderAdminDialog("table-5", 5);

    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText("No open bill at this table.")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Paid in cash" })).not.toBeInTheDocument();
  });
});

afterEach(() => clearTokens());

/** The staff check at `/bar/table/:tableId`, signed in so the board connects and loads. */
const renderStaffCheck = (tableId: string) => {
  saveTokens({ accessToken: "staff-token" });
  server.use(http.get("*/menu-items", () => HttpResponse.json([])));
  const realtime = createMockRealtime();
  const user = userEvent.setup();
  render(
    <RealtimeTestProviders realtime={realtime} path={`/bar/table/${tableId}`}>
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
    </RealtimeTestProviders>
  );
  return user;
};

describe("paying from the staff table view", () => {
  it("records a payment for the open table", async () => {
    const user = renderStaffCheck(TABLE_ID);

    await user.click(await screen.findByRole("button", { name: "Paid by card" }));
    await user.click(await screen.findByRole("button", { name: "Confirm payment" }));

    expect(await screen.findByText(/Paid · Card ·/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Show receipt" })).toBeInTheDocument();
  });

  it("tells bar staff to ask the owner when the TSE is not active", async () => {
    server.use(http.post("*/sessions/:sessionId/payments", () => HttpResponse.json({ code: "TSE_NOT_ACTIVE" }, { status: 412 })));
    const user = renderStaffCheck(TABLE_ID);

    await user.click(await screen.findByRole("button", { name: "Paid in cash" }));
    await user.click(await screen.findByRole("button", { name: "Confirm payment" }));

    expect(await screen.findByText("Ask the owner to activate the TSE")).toBeInTheDocument();
  });

  it("offers no payment while nobody is seated", async () => {
    renderStaffCheck("table-5");

    expect(await screen.findByText(/Nothing on this check yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Paid in cash" })).not.toBeInTheDocument();
  });
});
