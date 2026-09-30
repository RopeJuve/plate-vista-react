import { errorMessage } from "../../shared/realtime/errorMessages";
import type { ProtocolError } from "../../shared/realtime/protocol";
import type { CartCheck } from "./cartLimits";
import type { CartLine } from "./types";

export type PlaceOrderPhase = "idle" | "sending" | "success" | "error";

export type PlaceOrderStatus = {
  /** The order can go out now: there are lines, none is blocked, and the connection is up. */
  canPlace: boolean;
  /** What to tell the person ordering, most urgent first. Empty when there is nothing to say. */
  message: string;
  /** The first thing wrong with the lines themselves, whatever the connection is doing. */
  cartIssue: string;
  /** Lines to mark: unavailable on the menu, or refused by the server as out of stock. */
  unavailableIds: string[];
};

export const placeOrderStatus = ({
  lines,
  check,
  phase,
  error,
  outOfStockIds,
  canSend,
}: {
  lines: CartLine[];
  check: CartCheck;
  phase: PlaceOrderPhase;
  error: ProtocolError | null;
  outOfStockIds: string[];
  canSend: boolean;
}): PlaceOrderStatus => {
  const cartIssue = check.messages[0] || "";
  const message = !canSend
    ? "Connecting…"
    : phase === "sending"
      ? "Placing order…"
      : phase === "success"
        ? "Order placed"
        : error
          ? errorMessage(error.code, error.details, error.message)
          : cartIssue;

  return {
    canPlace: lines.length > 0 && phase !== "sending" && !check.blocking && canSend,
    message,
    cartIssue,
    unavailableIds: [...new Set([...check.unavailableIds, ...outOfStockIds])],
  };
};
