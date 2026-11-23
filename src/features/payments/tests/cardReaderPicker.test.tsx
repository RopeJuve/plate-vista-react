import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_ID } from "../../../mocks/fixtures/bill";
import {
  cardReaderBill,
  cardReaderPayingBill,
  cardReaderPaymentErrors,
  cardReaderPaymentInProgress,
  cardReaders,
  idleSimulatedReader,
} from "../../../mocks/fixtures/cardReaders";
import { apiPaths } from "../../../mocks/handlers/paths";
import { mockBillResponse, mockStartCardReaderPaymentResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import type { CardReader } from "../../../shared/api/payments";
import type { SessionBill } from "../../../shared/realtime/protocol";
import PayBillPanel from "../PayBillPanel";

const LAST_READER_KEY = "plateVista.lastCardReaderId";

/** The bill with the card reader offered on `readers`. */
const billWithReaders = (readers: CardReader[]): SessionBill => ({
  ...cardReaderBill(),
  cardReader: { state: "OFFERED", reason: null, readers },
});

/** Every reader id a `POST /sessions/:id/card-reader-payment` was sent for. */
const recordStarts = () => {
  const readerIds: string[] = [];
  server.use(
    http.post(apiPaths.cardReaderPayment, async ({ request }) => {
      const body = (await request.json()) as { readerId: string };
      readerIds.push(body.readerId);
      const reader = [cardReaders.bar, idleSimulatedReader].find(({ id }) => id === body.readerId) ?? cardReaders.bar;
      return HttpResponse.json(cardReaderPaymentInProgress(reader));
    })
  );
  return readerIds;
};

const renderPanel = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <PayBillPanel sessionId={SESSION_ID} canActivateTse={false} />
    </MemoryRouter>
  );
  return user;
};

/** Browser storage throws for the last-used reader, as in a private window or with site data blocked. */
const blockReaderStorage = () => {
  const getItem = Storage.prototype.getItem;
  const setItem = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) {
    if (key === LAST_READER_KEY) {
      throw new Error("blocked");
    }
    return getItem.call(this, key);
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
    if (key === LAST_READER_KEY) {
      throw new Error("blocked");
    }
    setItem.call(this, key, value);
  });
};

const picker = () => screen.findByRole("radiogroup", { name: "Card reader to use" });

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("picking the card reader", () => {
  it("preselects the reader this device used last and starts on it", async () => {
    localStorage.setItem(LAST_READER_KEY, idleSimulatedReader.id);
    mockBillResponse(200, billWithReaders([cardReaders.bar, idleSimulatedReader]));
    const starts = recordStarts();
    const user = renderPanel();

    const readers = await picker();
    expect(within(readers).getByRole("radio", { name: /Test reader/ })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Card reader" }));

    expect(await screen.findByText("Waiting for card")).toBeInTheDocument();
    expect(starts).toEqual([idleSimulatedReader.id]);
  });

  it("starts on the reader staff pick, and preselects it next time on this device", async () => {
    mockBillResponse(200, billWithReaders([cardReaders.bar, idleSimulatedReader]));
    const starts = recordStarts();
    const user = renderPanel();

    const readers = await picker();
    expect(within(readers).getByRole("radio", { name: /Bar/ })).toBeChecked();
    await user.click(within(readers).getByRole("radio", { name: /Test reader/ }));
    await user.click(screen.getByRole("button", { name: "Card reader" }));

    await screen.findByText("Waiting for card");
    expect(starts).toEqual([idleSimulatedReader.id]);
    expect(localStorage.getItem(LAST_READER_KEY)).toBe(idleSimulatedReader.id);
  });

  it("has no picker with one reader, and starts on it", async () => {
    mockBillResponse(200, billWithReaders([cardReaders.bar]));
    const starts = recordStarts();
    const user = renderPanel();

    await user.click(await screen.findByRole("button", { name: "Card reader" }));

    await screen.findByText("Waiting for card");
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(starts).toEqual([cardReaders.bar.id]);
  });

  it("lists offline and busy readers but won't let staff pick them, saying why", async () => {
    localStorage.setItem(LAST_READER_KEY, cardReaders.terrasse.id);
    mockBillResponse(200, billWithReaders([cardReaders.bar, cardReaders.terrasse, cardReaders.simulated]));
    renderPanel();

    const readers = await picker();
    const terrasse = within(readers).getByRole("radio", { name: /Terrasse/ });
    expect(terrasse).toBeDisabled();
    expect(terrasse.closest("label")).toHaveTextContent("Reader offline – check its Wi-Fi");
    const busy = within(readers).getByRole("radio", { name: /Test reader/ });
    expect(busy).toBeDisabled();
    expect(busy.closest("label")).toHaveTextContent("Busy with table 4");
    expect(within(readers).getByRole("radio", { name: /Bar/ })).toBeChecked();
  });

  it.each([
    ["throws", true],
    ["is empty", false],
  ])("preselects the first reader that can be picked when storage %s, and still starts", async (_, throws) => {
    if (throws) {
      blockReaderStorage();
    }
    mockBillResponse(200, billWithReaders([cardReaders.terrasse, idleSimulatedReader, cardReaders.bar]));
    const starts = recordStarts();
    const user = renderPanel();

    const readers = await picker();
    expect(within(readers).getByRole("radio", { name: /Test reader/ })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Card reader" }));

    await screen.findByText("Waiting for card");
    expect(starts).toEqual([idleSimulatedReader.id]);
  });
});

describe("when no reader can take the payment", () => {
  it("greys out the card reader with the reason when every reader is offline", async () => {
    mockBillResponse(200, {
      ...cardReaderBill(),
      cardReader: {
        state: "DISABLED",
        reason: "NO_READER_AVAILABLE",
        readers: [cardReaders.terrasse, { ...cardReaders.bar, status: "offline" }],
      },
    });
    renderPanel();

    expect(await screen.findByRole("button", { name: "Card reader" })).toBeDisabled();
    expect(screen.getByText("Every card reader is offline – check their Wi-Fi.")).toBeInTheDocument();
  });

  it("refreshes the readers' status and offers the reader once it is back online", async () => {
    const offline = { ...cardReaders.bar, status: "offline" as const };
    mockBillResponse(200, {
      ...cardReaderBill(),
      cardReader: { state: "DISABLED", reason: "NO_READER_AVAILABLE", readers: [offline] },
    });
    const user = renderPanel();
    expect(await screen.findByRole("button", { name: "Card reader" })).toBeDisabled();

    mockBillResponse(200, billWithReaders([cardReaders.bar]));
    await user.click(screen.getByRole("button", { name: "Refresh status" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Card reader" })).toBeEnabled());
  });
});

describe("a reader the API says is busy", () => {
  it("names the table it is busy with", async () => {
    mockBillResponse(200, billWithReaders([cardReaders.bar]));
    const { status, body } = cardReaderPaymentErrors.busy;
    mockStartCardReaderPaymentResponse(status, body);
    const user = renderPanel();

    await user.click(await screen.findByRole("button", { name: "Card reader" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("This reader is busy with table 7");
  });
});

describe("the card reader status screen", () => {
  it("shows the reader's name and that it is online, without a battery level", async () => {
    mockBillResponse(200, cardReaderPayingBill());
    renderPanel();

    const status = await screen.findByRole("region", { name: "Card reader payment" });
    expect(status).toHaveTextContent("Bar");
    expect(status).toHaveTextContent("Online");
    expect(status).not.toHaveTextContent(/battery/i);
  });

  it("says when the reader taking the payment has gone offline", async () => {
    const bill = cardReaderPayingBill();
    mockBillResponse(200, {
      ...bill,
      cardReader: { ...bill.cardReader!, readers: [{ ...cardReaders.bar, status: "offline" }] },
    });
    renderPanel();

    expect(await screen.findByRole("region", { name: "Card reader payment" })).toHaveTextContent("Offline");
  });
});
