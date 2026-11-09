import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TABLE_ID } from "../../../mocks/fixtures/staffBoard";
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
