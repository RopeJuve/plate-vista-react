import type { CardReader, CardReaderPayment, CardReaderUnavailableReason } from "../../shared/api/payments";
import type { SessionBill } from "../../shared/realtime/protocol";
import { READER_OFFLINE } from "./cardReaderAttempt";

const UNAVAILABLE: Record<CardReaderUnavailableReason, string> = {
  PAYOUT_ACCOUNT_NOT_READY: "The payout account can't take card payments yet.",
  TSE_NOT_ACTIVE: "The TSE is not active.",
  BILL_PAID: "Already paid.",
  BILL_EMPTY: "Nothing to pay.",
  PAYMENT_IN_PROGRESS: "A payment is already in progress.",
  NO_READER_AVAILABLE: "Every card reader is offline or busy.",
};

/** A reader in the pay panel's picker: whether staff can pick it, and why not. */
export type ReaderChoice = { reader: CardReader; selectable: boolean; note: string | null };

/** What the pay panel shows for "Card reader": a greyed button with why, or the readers to pick from. */
export type CardReaderOption =
  | { available: true; readers: ReaderChoice[] }
  | { available: false; reason: string; readers: ReaderChoice[] };

export const ALL_OFFLINE = "Every card reader is offline – check their Wi-Fi.";

const readerChoice = (reader: CardReader): ReaderChoice => {
  if (reader.status !== "online") {
    return { reader, selectable: false, note: `${READER_OFFLINE} – check its Wi-Fi` };
  }
  if (reader.busyWith) {
    return { reader, selectable: false, note: `Busy with table ${reader.busyWith.tableNumber}` };
  }
  return { reader, selectable: true, note: null };
};

/**
 * Why "Card reader" is greyed out, in staff words: the API's reason, except that "no reader available"
 * says so plainly when every reader is offline (Wi-Fi), not busy.
 */
export const unavailableReason = (reason: CardReaderUnavailableReason | null, readers: ReaderChoice[]) => {
  if (reason && reason !== "NO_READER_AVAILABLE") {
    return UNAVAILABLE[reason];
  }
  const allOffline = readers.length > 0 && readers.every(({ reader }) => reader.status !== "online");
  return allOffline ? ALL_OFFLINE : UNAVAILABLE.NO_READER_AVAILABLE;
};

/**
 * The card reader option for a bill, as the API decides it; `null` when the button is hidden
 * (or the server says nothing about card readers). Every reader is listed; only online ones that
 * are not busy can be picked.
 */
export const cardReaderOption = (bill: SessionBill): CardReaderOption | null => {
  const availability = bill.cardReader;
  if (!availability || availability.state === "HIDDEN") {
    return null;
  }
  const readers = availability.readers.map(readerChoice);
  if (availability.state === "OFFERED" && readers.some(({ selectable }) => selectable)) {
    return { available: true, readers };
  }
  return { available: false, reason: unavailableReason(availability.reason, readers), readers };
};

/** The reader the picker starts on: the one this device used last if it can be picked, else the first that can. */
export const preselectedReaderId = (readers: ReaderChoice[], lastUsedId: string | null): string | null => {
  const selectable = readers.filter((choice) => choice.selectable);
  return (selectable.find(({ reader }) => reader.id === lastUsedId) ?? selectable[0])?.reader.id ?? null;
};

/** Whether the reader taking `payment` is online, as the bill last reported it; `null` when the bill doesn't say. */
export const readerOnline = (bill: SessionBill, payment: CardReaderPayment): boolean | null => {
  const reader = bill.cardReader?.readers.find(({ id }) => id === payment.reader.id);
  return reader ? reader.status === "online" : null;
};
