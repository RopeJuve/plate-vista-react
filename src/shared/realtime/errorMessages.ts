import type { OnlinePaymentErrorCode } from "../api/payments";
import type { ErrorCode, ErrorDetails, ValidationDetails, InvalidTransitionDetails } from "./protocol";
import { ORDER_STATUS_LABEL, ProtocolError } from "./protocol";

const hasFields = (details: ErrorDetails): details is ValidationDetails =>
  Boolean(details && typeof details === "object" && "fields" in details);

const hasTransition = (details: ErrorDetails): details is InvalidTransitionDetails =>
  Boolean(details && typeof details === "object" && "from" in details && "to" in details);

/**
 * FE-02 — One function maps every protocol error code (+ details) to
 * user-friendly text. Nothing else in the app should hand-write error copy
 * for a `ProtocolError`. It also words the online payment codes the REST
 * endpoints answer with.
 */
export const errorMessage = (
  code: ErrorCode | OnlinePaymentErrorCode,
  details?: ErrorDetails,
  fallback?: string
): string => {
  switch (code) {
    case "VALIDATION": {
      if (hasFields(details)) {
        const first = Object.values(details.fields)[0];
        if (first) {
          return first;
        }
      }
      return fallback || "Please check the highlighted fields.";
    }
    case "NOT_FOUND":
      return "That order could not be found. It may have already been updated.";
    case "OUT_OF_STOCK":
      return "Some items in your order are out of stock.";
    case "FORBIDDEN":
      return "You don't have permission to do that.";
    case "INVALID_TRANSITION": {
      if (hasTransition(details)) {
        const from = ORDER_STATUS_LABEL[details.from] || details.from;
        const to = ORDER_STATUS_LABEL[details.to] || details.to;
        return `This order is already "${from}" and can't move to "${to}".`;
      }
      return "That order status change isn't allowed anymore.";
    }
    case "SESSION_CLOSED":
      return "This table was closed. Please ask your waiter.";
    case "BILL_PAID":
      return "This bill is already paid, so nothing more can be ordered.";
    case "BILL_FROZEN":
      return "Someone at this table is paying online, so the bill can't change right now.";
    case "BILL_PAYING_ONLINE":
      return "This bill was just paid online. It will show as paid in a moment.";
    case "ONLINE_PAYMENT_UNAVAILABLE":
      return "Online payment isn't available for this bill right now. Please ask your waiter.";
    case "PAYMENT_PROVIDER_ERROR":
      return "The online payment couldn't be started. The bill is still open, so please try again.";
    case "STRIPE_NOT_CONFIGURED":
      return "Online payment isn't set up yet.";
    case "RATE_LIMITED":
      return "Too many requests — please wait a moment and try again.";
    case "TIMEOUT":
      return "The server took too long to respond. Please try again.";
    case "INTERNAL":
    default:
      return fallback || "Something went wrong. Please try again.";
  }
};

/** Text for anything a realtime request threw: the protocol's own message, or `fallback` for a dropped socket and the like. */
export const requestErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof ProtocolError ? errorMessage(error.code, error.details, error.message) : fallback;
