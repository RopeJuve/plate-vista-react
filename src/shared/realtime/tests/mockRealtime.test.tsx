import { render, screen } from "@testing-library/react";
import { useEffect, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import { useRealtime } from "../RealtimeProvider";
import type { EventData } from "../protocol";

/** Shows the last receipt token the bill.paid event brought in. */
const PaidProbe = ({ onPaid }: { onPaid: (data: EventData<"bill.paid">) => void }) => {
  const { subscribe } = useRealtime();
  const [token, setToken] = useState("");
  useEffect(
    () =>
      subscribe("bill.paid", (data) => {
        onPaid(data);
        setToken(data.receiptToken);
      }),
    [subscribe, onPaid]
  );
  return <p>{token ? `Paid: ${token}` : "Unpaid"}</p>;
};

const billPaid: EventData<"bill.paid"> = {
  sessionId: "session-1",
  paymentId: "payment-1",
  receiptToken: "receipt-token-1",
  method: "CASH",
  totalCents: 2050,
};

describe("mock realtime", () => {
  it("delivers bill.paid to a subscriber through RealtimeProvider", () => {
    const realtime = createMockRealtime();
    const onPaid = vi.fn();
    render(
      <RealtimeTestProviders realtime={realtime}>
        <PaidProbe onPaid={onPaid} />
      </RealtimeTestProviders>
    );
    expect(screen.getByText("Unpaid")).toBeInTheDocument();

    realtime.emit("bill.paid", billPaid);

    expect(onPaid).toHaveBeenCalledWith(billPaid);
    expect(screen.getByText("Paid: receipt-token-1")).toBeInTheDocument();
  });

  it("stops delivering after the subscriber unmounts", () => {
    const realtime = createMockRealtime();
    const onPaid = vi.fn();
    const { unmount } = render(
      <RealtimeTestProviders realtime={realtime}>
        <PaidProbe onPaid={onPaid} />
      </RealtimeTestProviders>
    );
    unmount();

    realtime.emit("payment.signed", { paymentId: "payment-1", receiptToken: "receipt-token-1" });
    realtime.emit("bill.paid", billPaid);

    expect(onPaid).not.toHaveBeenCalled();
  });

  it("records requests and reports the connection open on demand", async () => {
    const realtime = createMockRealtime();
    const StatusProbe = () => <p>{useRealtime().status}</p>;
    render(
      <RealtimeTestProviders realtime={realtime}>
        <StatusProbe />
      </RealtimeTestProviders>
    );
    realtime.open();
    expect(screen.getByText("open")).toBeInTheDocument();

    realtime.onRequest(() => ({ order: { _id: "order-1" } }));
    await expect(
      realtime.client().request("order.cancel", { orderId: "order-1", reason: "no" })
    ).resolves.toEqual({ order: { _id: "order-1" } });
    expect(realtime.requests()).toEqual([
      { type: "order.cancel", payload: { orderId: "order-1", reason: "no" }, requestId: undefined },
    ]);
  });
});
