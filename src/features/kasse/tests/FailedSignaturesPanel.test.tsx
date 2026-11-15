import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { describe, expect, it } from "vitest";
import ToastProvider from "../../../Components/ToastProvider";
import { activeTse, activeTseWithFailures, failedSignatures } from "../../../mocks/fixtures/tse";
import { apiPaths } from "../../../mocks/handlers/paths";
import { mockTseFailedResponse, mockTseResponse, mockTseRetryResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import Kasse from "../../../pages/Kasse";
import { formatFailedAt } from "../failedSignatures";

const renderKasse = () => {
  const user = userEvent.setup();
  render(
    <ToastProvider>
      <Kasse />
    </ToastProvider>
  );
  return user;
};

/** The row of the failed signature with this amount, e.g. "42,50". */
const rowWith = (amount: string) => screen.getByRole("row", { name: new RegExp(amount) });

const badge = () => screen.getByTestId("failed-signatures-badge");

describe("Kasse failed signatures", () => {
  it("shows a green 'All signed' badge and the empty state at 0", async () => {
    mockTseResponse(200, activeTse);
    mockTseFailedResponse(200, { items: [] });
    renderKasse();

    expect(await screen.findByText("All receipts and orders are signed")).toBeInTheDocument();
    expect(badge()).toHaveTextContent("All signed");
    expect(badge().className).toMatch(/pass/);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows a red badge with the count at 3", async () => {
    mockTseResponse(200, activeTseWithFailures);
    renderKasse();

    await screen.findByRole("table");
    expect(badge()).toHaveTextContent("3 failed signatures");
    expect(badge().className).toMatch(/alert/);
  });

  it("lists type, table, date and time, amount, error and attempts for every row", async () => {
    mockTseResponse(200, activeTseWithFailures);
    renderKasse();

    await screen.findByRole("table");
    const first = rowWith("42,50");
    expect(within(first).getByText("Payment")).toBeInTheDocument();
    expect(within(first).getByText("4")).toBeInTheDocument();
    expect(within(first).getByText(formatFailedAt(failedSignatures[0].at))).toBeInTheDocument();
    expect(within(first).getByText(/42,50\s€/)).toBeInTheDocument();
    expect(within(first).getByText("TSS unreachable")).toBeInTheDocument();
    expect(within(first).getByText("1")).toBeInTheDocument();

    const order = rowWith("9,90");
    expect(within(order).getByText("Order")).toBeInTheDocument();
    expect(within(order).getByText("2")).toBeInTheDocument();
    expect(within(order).getByText("Signature timeout")).toBeInTheDocument();
    expect(within(order).getByText("0")).toBeInTheDocument();
    expect(rowWith("18,90")).toBeInTheDocument();
  });

  it("removes the row and lowers the count when the retry signs it", async () => {
    mockTseResponse(200, activeTseWithFailures);
    const retried: string[] = [];
    server.use(
      http.post(apiPaths.tseRetry, ({ params }) => {
        retried.push(`${params.kind}/${params.id}`);
        return HttpResponse.json({ status: "SIGNED" });
      })
    );
    const user = renderKasse();
    await screen.findByRole("table");

    await user.click(within(rowWith("42,50")).getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(screen.queryByRole("row", { name: /42,50/ })).not.toBeInTheDocument());
    expect(badge()).toHaveTextContent("2 failed signatures");
    expect(retried).toEqual(["PAYMENT/payment-failed-1"]);
    expect(rowWith("18,90")).toBeInTheDocument();
  });

  it("shows the empty state once the last row is signed", async () => {
    mockTseResponse(200, { ...activeTse, failedSignatures: 1 });
    mockTseFailedResponse(200, { items: [failedSignatures[2]] });
    const user = renderKasse();
    await screen.findByRole("table");

    await user.click(within(rowWith("9,90")).getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("All receipts and orders are signed")).toBeInTheDocument();
    expect(badge()).toHaveTextContent("All signed");
  });

  it("keeps the row with 'Still failing' and the new attempt count when the retry fails", async () => {
    mockTseResponse(200, activeTseWithFailures);
    mockTseRetryResponse(200, { status: "FAILED" });
    const user = renderKasse();
    await screen.findByRole("table");

    await user.click(within(rowWith("18,90")).getByRole("button", { name: "Retry" }));

    const row = rowWith("18,90");
    expect(await within(row).findByText("Still failing")).toBeInTheDocument();
    expect(within(row).getByText("3")).toBeInTheDocument();
    expect(badge()).toHaveTextContent("3 failed signatures");
  });

  it("disables the retry button while the retry runs", async () => {
    mockTseResponse(200, activeTseWithFailures);
    server.use(
      http.post(apiPaths.tseRetry, async () => {
        await delay(50);
        return HttpResponse.json({ status: "FAILED" });
      })
    );
    const user = renderKasse();
    await screen.findByRole("table");

    await user.click(within(rowWith("42,50")).getByRole("button", { name: "Retry" }));

    expect(within(rowWith("42,50")).getByRole("button", { name: /Retry/ })).toBeDisabled();
    expect(await within(rowWith("42,50")).findByText("Still failing")).toBeInTheDocument();
    expect(within(rowWith("42,50")).getByRole("button", { name: "Retry" })).toBeEnabled();
  });

  it("shows a readable message and keeps the list when a retry request fails", async () => {
    mockTseResponse(200, activeTseWithFailures);
    mockTseRetryResponse(500, { code: "INTERNAL" });
    const user = renderKasse();
    await screen.findByRole("table");

    await user.click(within(rowWith("42,50")).getByRole("button", { name: "Retry" }));

    expect(await screen.findByText(/could not retry the signature/i)).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(failedSignatures.length + 1);
    expect(within(rowWith("42,50")).getByText("1")).toBeInTheDocument();
    expect(badge()).toHaveTextContent("3 failed signatures");
  });

  it("shows a readable message when the list cannot be loaded", async () => {
    mockTseResponse(200, activeTseWithFailures);
    server.use(http.get(apiPaths.tseFailed, () => HttpResponse.error()));
    renderKasse();

    expect(await screen.findByText(/could not load the failed signatures/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload list" })).toBeEnabled();
  });

  it("does not load failures while the TSE is not active", async () => {
    mockTseResponse(200, { active: false, failedSignatures: 0 });
    let loaded = false;
    server.use(
      http.get(apiPaths.tseFailed, () => {
        loaded = true;
        return HttpResponse.json({ items: [] });
      })
    );
    renderKasse();

    await screen.findByRole("button", { name: "Activate TSE" });
    expect(screen.queryByTestId("failed-signatures-badge")).not.toBeInTheDocument();
    expect(loaded).toBe(false);
  });
});
