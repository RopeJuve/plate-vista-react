import type { JoinTableResult } from "./guestSession";

const SCAN_AGAIN = "Invalid table, please scan the QR code again";

/** What to tell a guest whose scan did not get them to a table. Empty when the result needs no message. */
export const joinFailureMessage = (result: JoinTableResult): string => {
  switch (result.status) {
    case "tooManyTries":
      return "Too many wrong codes. Please ask your waiter for help.";
    case "notFound":
      return SCAN_AGAIN;
    case "error":
      return result.message || SCAN_AGAIN;
    default:
      return "";
  }
};
