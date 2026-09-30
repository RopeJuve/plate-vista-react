import { describe, expect, it } from "vitest";
import { ProtocolError } from "../../../shared/realtime/protocol";
import type { CartCheck } from "../cartLimits";
import { placeOrderStatus } from "../placeOrderStatus";

const lines = [{ productId: "soup", quantity: 1, notes: "" }];
const fine: CartCheck = { blocking: false, messages: [], unavailableIds: [] };
const soldOut: CartCheck = { blocking: true, messages: ["Soup is unavailable."], unavailableIds: ["soup"] };

const status = (overrides: Partial<Parameters<typeof placeOrderStatus>[0]> = {}) =>
  placeOrderStatus({
    lines,
    check: fine,
    phase: "idle",
    error: null,
    outOfStockIds: [],
    canSend: true,
    ...overrides,
  });

describe("place order status", () => {
  it("lets a sound set of lines go out", () => {
    expect(status()).toEqual({ canPlace: true, message: "", cartIssue: "", unavailableIds: [] });
  });

  it("holds the order back while there is nothing to send, it is sending, or the line is down", () => {
    expect(status({ lines: [] }).canPlace).toBe(false);
    expect(status({ phase: "sending" }).canPlace).toBe(false);
    expect(status({ canSend: false }).canPlace).toBe(false);
    expect(status({ check: soldOut }).canPlace).toBe(false);
  });

  it("allows a retry after a failed order", () => {
    const error = new ProtocolError("TIMEOUT", "Timed out");
    expect(status({ phase: "error", error }).canPlace).toBe(true);
  });

  it("says the most urgent thing first", () => {
    const error = new ProtocolError("INTERNAL", "Boom");
    expect(status({ canSend: false, phase: "error", error, check: soldOut }).message).toBe("Connecting…");
    expect(status({ phase: "sending", check: soldOut }).message).toBe("Placing order…");
    expect(status({ phase: "success" }).message).toBe("Order placed");
    expect(status({ check: soldOut }).message).toBe("Soup is unavailable.");
    expect(status({ phase: "error", error, check: soldOut }).message).not.toBe("Soup is unavailable.");
  });

  it("keeps the cart issue apart from the connection", () => {
    expect(status({ canSend: false, check: soldOut }).cartIssue).toBe("Soup is unavailable.");
  });

  it("marks lines unavailable on the menu or refused as out of stock, once each", () => {
    expect(status({ check: soldOut, outOfStockIds: ["soup", "cola"] }).unavailableIds).toEqual(["soup", "cola"]);
  });
});
