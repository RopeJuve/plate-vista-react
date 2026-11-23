import { describe, expect, it } from "vitest";
import {
  cardBrandLabel,
  FAST_POLL_FOR_MS,
  formatServicePeriod,
  fundingLabel,
  paymentMethodTypeLabel,
  vatRateLetter,
  walletLabel,
  formatReceiptDateTime,
  isReceiptMissing,
  paymentMethodLabel,
  readMethodLabel,
  receiptPollDelay,
  signatureNotice,
  vatRateLabel,
} from "../receipt";

describe("receiptPollDelay", () => {
  it("polls every 2 s while the signature is pending for the first 30 s", () => {
    expect(receiptPollDelay("PENDING", 0)).toBe(2_000);
    expect(receiptPollDelay("PENDING", FAST_POLL_FOR_MS - 1)).toBe(2_000);
  });

  it("slows to every 30 s once the signature has been pending for 30 s", () => {
    expect(receiptPollDelay("PENDING", FAST_POLL_FOR_MS)).toBe(30_000);
  });

  it("polls every 30 s while the signature failed", () => {
    expect(receiptPollDelay("FAILED", 0)).toBe(30_000);
  });

  it("stops once the receipt is signed", () => {
    expect(receiptPollDelay("SIGNED", 0)).toBeNull();
  });
});

describe("signatureNotice", () => {
  it("says the signature is being made while it is fresh", () => {
    expect(signatureNotice("PENDING", 1_000)).toBe("Signatur wird erstellt…");
  });

  it("says it will follow once signing failed or took over 30 s", () => {
    expect(signatureNotice("FAILED", 0)).toBe("TSE-Signatur wird nachgereicht");
    expect(signatureNotice("PENDING", FAST_POLL_FOR_MS)).toBe("TSE-Signatur wird nachgereicht");
  });

  it("has nothing to say about a signed receipt", () => {
    expect(signatureNotice("SIGNED", 0)).toBeNull();
  });
});

describe("labels", () => {
  it("names the VAT rates by percentage", () => {
    expect(vatRateLabel("NORMAL")).toBe("19 %");
    expect(vatRateLabel("REDUCED_1")).toBe("7 %");
  });

  it("names the payment methods in German", () => {
    expect(paymentMethodLabel("CASH")).toBe("Bar");
    expect(paymentMethodLabel("CARD_TERMINAL")).toBe("Karte");
    expect(paymentMethodLabel("ONLINE")).toBe("Online");
  });

  it("does not tell the guest a card reader from a Card Terminal", () => {
    expect(paymentMethodLabel("CARD_READER")).toBe("Karte");
  });

  it("names how the card reader read the card: contactless or chip", () => {
    expect(readMethodLabel("contactless_emv")).toBe("Kontaktlos");
    expect(readMethodLabel("contact_emv")).toBe("Chip");
    expect(readMethodLabel(undefined)).toBeNull();
  });

  it("formats a time in German, in German local time", () => {
    expect(formatReceiptDateTime("2026-11-07T19:30:00.000Z")).toBe("07.11.2026, 20:30:00");
    expect(formatReceiptDateTime("2026-07-07T19:30:05.000Z")).toBe("07.07.2026, 21:30:05");
  });

  it("shows nothing for a missing or broken time", () => {
    expect(formatReceiptDateTime(undefined)).toBe("");
    expect(formatReceiptDateTime("nope")).toBe("");
  });
});

describe("isReceiptMissing", () => {
  it("is true only for a 404 answer", () => {
    expect(isReceiptMissing({ response: { status: 404 } })).toBe(true);
    expect(isReceiptMissing({ response: { status: 500 } })).toBe(false);
    expect(isReceiptMissing(new Error("offline"))).toBe(false);
    expect(isReceiptMissing(null)).toBe(false);
  });
});

describe("receipt labels for the redesigned receipt", () => {
  it("marks 19 % with A and 7 % with B", () => {
    expect(vatRateLetter("NORMAL")).toBe("A");
    expect(vatRateLetter("REDUCED_1")).toBe("B");
  });

  it("prints card brands in capitals, known or not", () => {
    expect(cardBrandLabel("visa")).toBe("VISA");
    expect(cardBrandLabel("amex")).toBe("AMEX");
    expect(cardBrandLabel("cartes_bancaires")).toBe("CB");
    expect(cardBrandLabel("new_brand")).toBe("NEW BRAND");
    expect(cardBrandLabel(undefined)).toBe("KARTE");
  });

  it("names wallets, funding and payment method types as guests know them", () => {
    expect(walletLabel("apple_pay")).toBe("Apple Pay");
    expect(walletLabel("masterpass")).toBe("Masterpass");
    expect(fundingLabel("credit")).toBe("Kredit");
    expect(fundingLabel("unknown")).toBeNull();
    expect(fundingLabel(undefined)).toBeNull();
    expect(paymentMethodTypeLabel("sepa_debit")).toBe("SEPA-Lastschrift");
    expect(paymentMethodTypeLabel("paypal")).toBe("PayPal");
    expect(paymentMethodTypeLabel("revolut_pay")).toBe("Revolut Pay");
    expect(paymentMethodTypeLabel("twint")).toBe("Twint");
  });

  it("prints the Service Period in German local time", () => {
    expect(formatServicePeriod({ start: "2026-11-07T18:05:12.000Z", end: "2026-11-07T19:30:00.000Z" })).toBe(
      "07.11.2026, 19:05:12 – 07.11.2026, 20:30:00"
    );
  });
});
