import { act, render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { pendingReceipt, PENDING_RECEIPT_TOKEN, signedReceipt } from "../../../mocks/fixtures/receipts";
import { apiPaths } from "../../../mocks/handlers/paths";
import { server } from "../../../mocks/server";
import type { Receipt } from "../../../shared/api/payments";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import ReceiptPage from "../ReceiptPage";

/** Answers every receipt fetch with `current.receipt` and counts them. */
const serveReceipt = (receipt: Receipt) => {
  const served = { receipt, fetches: 0 };
  server.use(
    http.get(apiPaths.receipt, () => {
      served.fetches += 1;
      return HttpResponse.json(served.receipt);
    })
  );
  return served;
};

/** Lets the clock move by `ms` and every request and render it triggers settle. */
const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

const renderReceipt = async () => {
  render(
    <RealtimeTestProviders realtime={createMockRealtime()} path={`/receipt/${PENDING_RECEIPT_TOKEN}`}>
      <Routes>
        <Route path="/receipt/:receiptToken" element={<ReceiptPage />} />
      </Routes>
    </RealtimeTestProviders>
  );
  await advance(0);
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("receipt polling", () => {
  it("polls every 2 s while pending and stops once signed", async () => {
    const served = serveReceipt(pendingReceipt);
    await renderReceipt();
    expect(served.fetches).toBe(1);
    expect(screen.getByText("Signatur wird erstellt…")).toBeInTheDocument();

    await advance(1_999);
    expect(served.fetches).toBe(1);
    await advance(1);
    expect(served.fetches).toBe(2);
    await advance(2_000);
    expect(served.fetches).toBe(3);

    served.receipt = signedReceipt;
    await advance(2_000);
    expect(served.fetches).toBe(4);
    expect(screen.getByRole("region", { name: "TSE-Signatur" })).toBeInTheDocument();

    await advance(120_000);
    expect(served.fetches).toBe(4);
  });

  it("slows to every 30 s after 30 s pending and says the signature will follow", async () => {
    const served = serveReceipt(pendingReceipt);
    await renderReceipt();

    await advance(28_000);
    expect(served.fetches).toBe(15);
    expect(screen.getByText("Signatur wird erstellt…")).toBeInTheDocument();

    await advance(2_000);
    expect(served.fetches).toBe(16);
    expect(screen.getByText("TSE-Signatur wird nachgereicht")).toBeInTheDocument();

    await advance(29_999);
    expect(served.fetches).toBe(16);
    await advance(1);
    expect(served.fetches).toBe(17);
    await advance(30_000);
    expect(served.fetches).toBe(18);

    served.receipt = signedReceipt;
    await advance(30_000);
    expect(screen.getByRole("region", { name: "TSE-Signatur" })).toBeInTheDocument();
    await advance(120_000);
    expect(served.fetches).toBe(19);
  });

  it("polls a failed receipt every 30 s while the page is open", async () => {
    const served = serveReceipt({ ...pendingReceipt, signature: { status: "FAILED" } });
    await renderReceipt();
    expect(screen.getByText("TSE-Signatur wird nachgereicht")).toBeInTheDocument();

    await advance(29_999);
    expect(served.fetches).toBe(1);
    await advance(1);
    expect(served.fetches).toBe(2);
    await advance(30_000);
    expect(served.fetches).toBe(3);
  });
});
