import { describe, expect, it } from "vitest";
import {
  cardReaderBill,
  cardReaderFailedBill,
  cardReaders,
  idleSimulatedReader,
} from "../../../mocks/fixtures/cardReaders";
import type { CardReader } from "../../../shared/api/payments";
import {
  ALL_OFFLINE,
  cardReaderOption,
  preselectedReaderId,
  retryBlockedNote,
  unavailableReason,
  type ReaderChoice,
} from "../cardReaderAvailability";

const choice = (reader: CardReader, selectable = true): ReaderChoice => ({ reader, selectable, note: null });
const offline = (reader: CardReader): CardReader => ({ ...reader, status: "offline" });

describe("preselectedReaderId", () => {
  const readers = [choice(cardReaders.terrasse, false), choice(cardReaders.bar), choice(idleSimulatedReader)];

  it("starts on the reader this device used last when it can be picked", () => {
    expect(preselectedReaderId(readers, idleSimulatedReader.id)).toBe(idleSimulatedReader.id);
  });

  it("starts on the first reader that can be picked when the last one can't, or there is none", () => {
    expect(preselectedReaderId(readers, cardReaders.terrasse.id)).toBe(cardReaders.bar.id);
    expect(preselectedReaderId(readers, "gone-reader")).toBe(cardReaders.bar.id);
    expect(preselectedReaderId(readers, null)).toBe(cardReaders.bar.id);
  });

  it("starts on nothing when no reader can be picked", () => {
    expect(preselectedReaderId([choice(cardReaders.terrasse, false)], cardReaders.terrasse.id)).toBeNull();
    expect(preselectedReaderId([], null)).toBeNull();
  });
});

describe("unavailableReason", () => {
  it("says every reader is offline, with Wi-Fi to check, when none is online", () => {
    const readers = [choice(cardReaders.terrasse, false), choice(offline(cardReaders.bar), false)];
    expect(unavailableReason("NO_READER_AVAILABLE", readers)).toBe(ALL_OFFLINE);
    expect(ALL_OFFLINE).toBe("Every card reader is offline – check their Wi-Fi.");
  });

  it("says offline or busy when some reader is online but busy", () => {
    const readers = [choice(cardReaders.terrasse, false), choice(cardReaders.simulated, false)];
    expect(unavailableReason("NO_READER_AVAILABLE", readers)).toBe("Every card reader is offline or busy.");
  });

  it("says offline or busy when there is no reader to tell", () => {
    expect(unavailableReason(null, [])).toBe("Every card reader is offline or busy.");
  });

  it("gives the API's other reasons in staff words, whatever the readers", () => {
    const readers = [choice(cardReaders.terrasse, false)];
    expect(unavailableReason("TSE_NOT_ACTIVE", readers)).toBe("The TSE is not active.");
    expect(unavailableReason("PAYOUT_ACCOUNT_NOT_READY", readers)).toBe(
      "The payout account can't take card payments yet."
    );
  });
});

describe("cardReaderOption", () => {
  it("notes why an offline or busy reader can't be picked", () => {
    const option = cardReaderOption({
      ...cardReaderBill(),
      cardReader: {
        state: "OFFERED",
        reason: null,
        readers: [cardReaders.bar, cardReaders.terrasse, cardReaders.simulated],
      },
    });
    expect(option?.readers.map(({ selectable, note }) => [selectable, note])).toEqual([
      [true, null],
      [false, "Reader offline – check its Wi-Fi"],
      [false, "Busy with table 4"],
    ]);
  });

  it("is unavailable when the API offers it but no reader can be picked", () => {
    const option = cardReaderOption({
      ...cardReaderBill(),
      cardReader: { state: "OFFERED", reason: null, readers: [cardReaders.terrasse] },
    });
    expect(option).toMatchObject({ available: false, reason: ALL_OFFLINE });
  });
});

describe("retryBlockedNote", () => {
  const failed = cardReaderFailedBill();
  const attempt = failed.cardReaderPayment!;
  const listing = (...readers: CardReader[]) => ({
    ...failed,
    cardReader: { state: "OFFERED" as const, reason: null, readers },
  });

  it("lets Retry go to the reader that failed when it is online and free", () => {
    expect(retryBlockedNote(listing(cardReaders.bar), attempt)).toBeNull();
  });

  it("says why Retry can't go to the reader that failed: offline, or busy with another table", () => {
    expect(retryBlockedNote(listing(offline(cardReaders.bar)), attempt)).toBe("Reader offline – check its Wi-Fi");
    const busy = { ...cardReaders.bar, busyWith: { sessionId: "other-session", tableNumber: 9 } };
    expect(retryBlockedNote(listing(busy), attempt)).toBe("Busy with table 9");
  });

  it("leaves Retry to the server when the bill doesn't list the reader", () => {
    expect(retryBlockedNote(listing(cardReaders.terrasse), attempt)).toBeNull();
    expect(retryBlockedNote({ ...failed, cardReader: undefined }, attempt)).toBeNull();
  });
});
