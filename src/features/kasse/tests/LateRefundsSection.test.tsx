import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import ToastProvider from "../../../Components/ToastProvider";
import { lateRefunds } from "../../../mocks/fixtures/onlinePayments";
import { apiPaths } from "../../../mocks/handlers/paths";
import { mockOnlinePaymentRefundsResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import Kasse from "../../../pages/Kasse";
import type { OnlinePaymentRefund } from "../../../shared/api/payments";
import { clearTokens, saveTokens } from "../../../shared/api/tokens";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import { formatRefundedAt } from "../lateRefunds";

const [newest, middle, oldest] = lateRefunds;

/** Signs in with this role and opens the Kasse page with the mocked staff socket. */
const renderKasseAs = (role: string) => {
  server.use(http.get("*/auth/user", () => HttpResponse.json({ user: { _id: "u1", role } })));
  saveTokens({ accessToken: "test-token" });
  const realtime = createMockRealtime();
  const user = userEvent.setup();
  render(
    <RealtimeTestProviders realtime={realtime} path="/admin/kasse">
      <ToastProvider>
        <Kasse />
      </ToastProvider>
    </RealtimeTestProviders>
  );
  return { user, realtime };
};

const section = () => within(screen.getByRole("region", { name: "Refunded online payments" }));

const rows = async () => {
  const list = await screen.findByRole("list", { name: "Refunded online payments" });
  return within(list).getAllByRole("listitem");
};

/** Answers the first page with `first`, and `before=` with `older` as the last page. */
const pagedRefunds = (first: OnlinePaymentRefund[], older: OnlinePaymentRefund[]) => {
  const befores: (string | null)[] = [];
  server.use(
    http.get(apiPaths.onlinePaymentRefunds, ({ request }) => {
      const before = new URL(request.url).searchParams.get("before");
      befores.push(before);
      return before
        ? HttpResponse.json({ items: older, nextBefore: null })
        : HttpResponse.json({ items: first, nextBefore: first[first.length - 1].refundedAt });
    })
  );
  return befores;
};

afterEach(() => clearTokens());

describe("Kasse refunded online payments", () => {
  it.each(["owner", "admin"])("shows the %s table, amount, readable reason and time, newest first", async (role) => {
    renderKasseAs(role);

    const [first, second, third] = await rows();
    expect(first).toHaveTextContent("Table 2");
    expect(first).toHaveTextContent(/31,20\s€/);
    expect(first).toHaveTextContent("Table was already closed");
    expect(first).toHaveTextContent(formatRefundedAt(newest.refundedAt));
    expect(second).toHaveTextContent("Table 7");
    expect(second).toHaveTextContent("Payment arrived after it was cancelled");
    expect(third).toHaveTextContent("Table 4");
    expect(third).toHaveTextContent(/20,50\s€/);
    expect(third).toHaveTextContent("Bill was already paid");
  });

  it("appends the next page on 'Show more' and hides the button at the end", async () => {
    const befores = pagedRefunds([newest, middle], [oldest]);
    const { user } = renderKasseAs("owner");
    expect(await rows()).toHaveLength(2);

    await user.click(section().getByRole("button", { name: "Show more" }));

    await waitFor(async () => expect(await rows()).toHaveLength(3));
    const [, , last] = await rows();
    expect(last).toHaveTextContent("Table 4");
    expect(befores).toEqual([null, middle.refundedAt]);
    expect(section().queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
  });

  it("shows no 'Show more' when there is only one page", async () => {
    renderKasseAs("owner");
    await rows();
    expect(section().queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
  });

  it("keeps the section with an empty state when nothing was refunded", async () => {
    mockOnlinePaymentRefundsResponse(200, { items: [], nextBefore: null });
    renderKasseAs("owner");

    expect(await screen.findByText("No refunded online payments.")).toBeInTheDocument();
    expect(section().queryByRole("list")).not.toBeInTheDocument();
  });

  it("says so and offers a reload when the list cannot be loaded", async () => {
    server.use(http.get(apiPaths.onlinePaymentRefunds, () => HttpResponse.error()));
    renderKasseAs("owner");

    expect(await screen.findByText(/could not load the refunded online payments/i)).toBeInTheDocument();
    expect(section().getByRole("button", { name: "Reload list" })).toBeEnabled();
  });

  it("puts a live refund first, once, even when the event repeats", async () => {
    mockOnlinePaymentRefundsResponse(200, { items: [middle, oldest], nextBefore: null });
    const { realtime } = renderKasseAs("owner");
    expect(await rows()).toHaveLength(2);

    realtime.emit("online_payment.refunded", { refund: newest });
    realtime.emit("online_payment.refunded", { refund: newest });

    const shown = await rows();
    expect(shown).toHaveLength(3);
    expect(shown[0]).toHaveTextContent("Table 2");
  });

  it("shows a live refund in place of the empty state", async () => {
    mockOnlinePaymentRefundsResponse(200, { items: [], nextBefore: null });
    const { realtime } = renderKasseAs("admin");
    await screen.findByText("No refunded online payments.");

    realtime.emit("online_payment.refunded", { refund: oldest });

    expect(await rows()).toHaveLength(1);
    expect(screen.queryByText("No refunded online payments.")).not.toBeInTheDocument();
  });
});
