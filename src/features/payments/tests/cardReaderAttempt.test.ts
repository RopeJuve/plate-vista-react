import { describe, expect, it } from "vitest";
import { cardReaderFailedBill, cardReaderPayingBill } from "../../../mocks/fixtures/cardReaders";
import { paidBill } from "../../../mocks/fixtures/payments";
import { cardReaderFailed, cardReaderFailureTitle } from "../cardReaderAttempt";

describe("cardReaderFailed", () => {
  it("is the bill's last attempt when it failed and nothing replaced it", () => {
    const bill = cardReaderFailedBill();
    expect(cardReaderFailed(bill)).toBe(bill.cardReaderPayment);
  });

  it("is nothing while an attempt is in progress", () => {
    expect(cardReaderFailed(cardReaderPayingBill())).toBeNull();
  });

  it("is nothing once the bill is paid", () => {
    expect(cardReaderFailed({ ...cardReaderFailedBill(), payment: paidBill.payment })).toBeNull();
  });

  it("is nothing while the bill is frozen again", () => {
    expect(cardReaderFailed({ ...cardReaderFailedBill(), freeze: cardReaderPayingBill().freeze })).toBeNull();
  });
});

describe("cardReaderFailureTitle", () => {
  it("names a known reason in a few words", () => {
    expect(cardReaderFailureTitle({ reason: "INSUFFICIENT_FUNDS", message: "Declined for funds." })).toBe(
      "Card declined: insufficient funds"
    );
    expect(cardReaderFailureTitle({ reason: "READER_OFFLINE", message: "Lost connection." })).toBe("Reader offline");
  });

  it("reads the server's sentence for a reason it has no words for", () => {
    expect(cardReaderFailureTitle({ reason: "OTHER", message: "Something odd happened." })).toBe(
      "Something odd happened."
    );
  });

  it("says the payment failed when there is nothing to tell", () => {
    expect(cardReaderFailureTitle(null)).toBe("The card reader payment failed.");
    expect(cardReaderFailureTitle({ reason: "OTHER", message: "" })).toBe("The card reader payment failed.");
  });
});
