import { describe, expect, it } from "vitest";
import { cardReaderErrors, cardReaders } from "../../../mocks/fixtures/cardReaders";
import {
  cardReaderErrorMessage,
  deviceName,
  readerGone,
  stripeNotConfigured,
  withoutReader,
  withReader,
} from "../cardReaders";

const answer = ({ status, body }: { status: number; body: unknown }) => ({ response: { status, data: body } });

describe("deviceName", () => {
  it("names the readers Stripe sells", () => {
    expect(deviceName("stripe_s700")).toBe("Stripe Reader S700");
    expect(deviceName("stripe_s710")).toBe("Stripe Reader S710");
    expect(deviceName("bbpos_wisepos_e")).toBe("BBPOS WisePOS E");
    expect(deviceName("simulated_wisepos_e")).toBe("Simulated WisePOS E");
  });

  it("shows a device type it does not know as Stripe sends it", () => {
    expect(deviceName("stripe_s900")).toBe("stripe_s900");
  });
});

describe("reader list", () => {
  it("keeps readers sorted by name when one is added", () => {
    const added = { ...cardReaders.bar, id: "new", name: "Küche" };
    expect(withReader([cardReaders.bar, cardReaders.terrasse], added).map((reader) => reader.name)).toEqual([
      "Bar",
      "Küche",
      "Terrasse",
    ]);
  });

  it("drops a removed reader by id", () => {
    expect(withoutReader([cardReaders.bar, cardReaders.terrasse], cardReaders.bar.id)).toEqual([cardReaders.terrasse]);
  });
});

describe("cardReaderErrorMessage", () => {
  it("explains an invalid or used registration code", () => {
    expect(cardReaderErrorMessage(answer(cardReaderErrors.codeInvalid))).toMatch(/expired or already used/);
  });

  it("names the table a busy reader is taking a payment for", () => {
    expect(cardReaderErrorMessage(answer(cardReaderErrors.busy))).toBe(
      "This reader is taking a payment for table 4. Cancel that payment first."
    );
  });

  it("falls back to a plain retry message for anything else", () => {
    expect(cardReaderErrorMessage(new Error("Network Error"))).toBe("Something went wrong. Please try again.");
  });
});

describe("error kinds", () => {
  it("tells a server without Stripe keys apart from other failures", () => {
    expect(stripeNotConfigured(answer(cardReaderErrors.stripeNotConfigured))).toBe(true);
    expect(stripeNotConfigured(answer(cardReaderErrors.providerError))).toBe(false);
  });

  it("treats 404 on remove as already gone", () => {
    expect(readerGone(answer(cardReaderErrors.notFound))).toBe(true);
    expect(readerGone(answer(cardReaderErrors.busy))).toBe(false);
  });
});
