import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SESSION_ID, unpaidBill } from "../../../mocks/fixtures/bill";
import { paidBill, payment, payResponses } from "../../../mocks/fixtures/payments";
import { apiPaths } from "../../../mocks/handlers/paths";
import { mockBillResponse, mockPayResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import type { PayBillBody } from "../../../shared/api/payments";
import { formatCents } from "../../../shared/money/formatCents";
import { clockTime } from "../../../services/time";
import PayBillPanel from "../PayBillPanel";

/** Records every pay request body; each answer waits a little so a second tap lands while the first runs. */
const recordPayments = (answer?: (body: PayBillBody) => Response | Promise<Response>) => {
  const bodies: PayBillBody[] = [];
  server.use(
    http.post(apiPaths.pay, async ({ request }) => {
      const body = (await request.json()) as PayBillBody;
      bodies.push(body);
      await delay(30);
      return answer
        ? answer(body)
        : HttpResponse.json({ ...payment, method: body.method, amountCents: body.expectedTotalCents }, { status: 201 });
    })
  );
  return bodies;
};

/** A formatted amount as Testing Library reads it: the non-breaking space before € becomes a plain one. */
const money = (cents: number) => formatCents(cents).replace(/\s/g, " ");

const renderPanel = (canActivateTse = false) => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <PayBillPanel sessionId={SESSION_ID} canActivateTse={canActivateTse} />
    </MemoryRouter>
  );
  return user;
};

const confirmDialog = () => screen.findByRole("dialog");

const payWith = async (user: ReturnType<typeof userEvent.setup>, button: string) => {
  await user.click(await screen.findByRole("button", { name: button }));
  const dialog = await confirmDialog();
  await user.click(within(dialog).getByRole("button", { name: "Confirm payment" }));
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("PayBillPanel", () => {
  it("shows the unpaid total and both ways to pay", async () => {
    renderPanel();

    expect(await screen.findByText(money(2050))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Paid in cash" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Paid by card" })).toBeEnabled();
  });

  it("sends CASH with the displayed total after confirming", async () => {
    const bodies = recordPayments();
    const user = renderPanel();

    await user.click(await screen.findByRole("button", { name: "Paid in cash" }));
    const dialog = await confirmDialog();
    expect(within(dialog).getByText(money(2050))).toBeInTheDocument();
    expect(within(dialog).getByText("Cash")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Confirm payment" }));

    expect(await screen.findByText(/Paid · Cash ·/)).toBeInTheDocument();
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toMatchObject({ method: "CASH", expectedTotalCents: 2050 });
    expect(bodies[0].clientPaymentId).toEqual(expect.any(String));
  });

  it("sends CARD_TERMINAL with the displayed total after confirming", async () => {
    const bodies = recordPayments();
    const user = renderPanel();

    await payWith(user, "Paid by card");

    expect(await screen.findByText(/Paid · Card ·/)).toBeInTheDocument();
    expect(bodies).toEqual([expect.objectContaining({ method: "CARD_TERMINAL", expectedTotalCents: 2050 })]);
  });

  it("sends nothing when the confirm step is cancelled", async () => {
    const bodies = recordPayments();
    const user = renderPanel();

    await user.click(await screen.findByRole("button", { name: "Paid in cash" }));
    await user.click(within(await confirmDialog()).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(bodies).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Paid in cash" })).toBeEnabled();
  });

  it("sends one request on a double tap and disables the buttons while it is pending", async () => {
    const bodies = recordPayments();
    const user = renderPanel();

    await user.click(await screen.findByRole("button", { name: "Paid in cash" }));
    const confirm = within(await confirmDialog()).getByRole("button", { name: "Confirm payment" });
    await user.dblClick(confirm);

    expect(confirm).toBeDisabled();
    expect(await screen.findByText(/Paid · Cash ·/)).toBeInTheDocument();
    expect(bodies).toHaveLength(1);
  });

  it("reuses the same clientPaymentId when retrying after a network error", async () => {
    let attempt = 0;
    const bodies = recordPayments((body) => {
      attempt += 1;
      return attempt === 1
        ? HttpResponse.error()
        : HttpResponse.json({ ...payment, method: body.method }, { status: 200 });
    });
    const user = renderPanel();

    await payWith(user, "Paid in cash");
    const dialog = await confirmDialog();
    expect(await within(dialog).findByText(/Could not reach the server/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Confirm payment" }));

    expect(await screen.findByText(/Paid · Cash ·/)).toBeInTheDocument();
    expect(bodies).toHaveLength(2);
    expect(bodies[1].clientPaymentId).toBe(bodies[0].clientPaymentId);
  });

  it("uses a new clientPaymentId for a new confirm step", async () => {
    const bodies = recordPayments(() => HttpResponse.json(payResponses.billChanged.body, { status: 409 }));
    const user = renderPanel();

    await payWith(user, "Paid in cash");
    await screen.findByText(/The bill changed/);
    await payWith(user, "Paid in cash");
    await waitFor(() => expect(bodies).toHaveLength(2));

    expect(bodies[1].clientPaymentId).not.toBe(bodies[0].clientPaymentId);
  });

  it("reloads the bill and asks again when the bill changed (409 BILL_CHANGED)", async () => {
    mockPayResponse(409, { code: "BILL_CHANGED", totalCents: 2800 });
    const user = renderPanel();
    await screen.findByText(money(2050));
    mockBillResponse(200, { ...unpaidBill, totalCents: 2800 });

    await payWith(user, "Paid in cash");

    expect(
      await screen.findByText(`The bill changed — new total ${money(2800)}. Please confirm again.`)
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Paid in cash" })).toBeEnabled();
    expect(screen.queryByText(/^Paid ·/)).not.toBeInTheDocument();
  });

  it("reloads the bill and shows it as already paid (409 BILL_PAID)", async () => {
    mockPayResponse(409, { code: "BILL_PAID" });
    const user = renderPanel();
    await screen.findByText(money(2050));
    mockBillResponse(200, paidBill);

    await payWith(user, "Paid by card");

    expect(await screen.findByText("Already paid")).toBeInTheDocument();
    expect(await screen.findByText(/Paid · Card ·/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Paid in cash" })).not.toBeInTheDocument();
  });

  it("tells an owner or admin to activate the TSE, with a link to the till page (412)", async () => {
    mockPayResponse(412, { code: "TSE_NOT_ACTIVE" });
    const user = renderPanel(true);

    await payWith(user, "Paid in cash");

    const link = await screen.findByRole("link", { name: "Activate the TSE first" });
    expect(link).toHaveAttribute("href", "/admin/kasse");
    expect(screen.queryByText(/Paid ·/)).not.toBeInTheDocument();
  });

  it("tells other staff to ask the owner (412)", async () => {
    mockPayResponse(412, { code: "TSE_NOT_ACTIVE" });
    const user = renderPanel(false);

    await payWith(user, "Paid in cash");

    expect(await screen.findByText("Ask the owner to activate the TSE")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Activate the TSE/ })).not.toBeInTheDocument();
  });

  it("says there is nothing to pay (422 BILL_EMPTY)", async () => {
    mockPayResponse(422, { code: "BILL_EMPTY" });
    const user = renderPanel();

    await payWith(user, "Paid in cash");

    expect(await screen.findByText("Nothing to pay — close the table instead")).toBeInTheDocument();
  });

  it("shows the receipt link, QR code and a pending signature after paying", async () => {
    vi.stubEnv("VITE_PLATE_VISTA_URL", "https://plate.example/");
    recordPayments();
    const user = renderPanel();

    await payWith(user, "Paid by card");

    expect(await screen.findByText(`Paid · Card · ${clockTime(payment.paidAt)}`)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Show receipt" })).toHaveAttribute(
      "href",
      "/receipt/receipt-token-1"
    );
    const qr = await screen.findByRole("img", { name: "QR code for the receipt" });
    expect(qr).toHaveAttribute("data-url", "https://plate.example/receipt/receipt-token-1");
    expect(qr.getAttribute("src")).toMatch(/^data:image\/svg\+xml/);
    expect(screen.getByText("Signature pending")).toBeInTheDocument();
  });

  it("leaves out the pending note once the signature is done", async () => {
    recordPayments((body) =>
      HttpResponse.json({ ...payment, method: body.method, signature: { status: "SIGNED" } }, { status: 201 })
    );
    const user = renderPanel();

    await payWith(user, "Paid in cash");

    expect(await screen.findByText(/Paid · Cash ·/)).toBeInTheDocument();
    expect(screen.queryByText("Signature pending")).not.toBeInTheDocument();
  });

  it("shows an already paid bill straight away, without pay buttons", async () => {
    mockBillResponse(200, paidBill);
    renderPanel();

    expect(await screen.findByText(/Paid · Card ·/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Show receipt" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Paid in cash" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Paid by card" })).not.toBeInTheDocument();
  });

  it("never shows the bill as paid without a 2xx answer", async () => {
    recordPayments(() => HttpResponse.json({ code: "INTERNAL" }, { status: 500 }));
    const user = renderPanel();

    await payWith(user, "Paid in cash");

    expect(await within(await confirmDialog()).findByText(/Could not record the payment/)).toBeInTheDocument();
    expect(screen.queryByText(/Paid ·/)).not.toBeInTheDocument();
  });
});
