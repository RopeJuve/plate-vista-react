import type { PaymentErrorBody } from "../../shared/api/payments";
import { errorMessage } from "../../shared/realtime/errorMessages";

/** Why a guest's "Pay online" did not leave for the payment page. */
export type OnlinePaymentStartProblem = {
  message: string;
  /** The bill on screen is out of date (no longer payable online): read it again. */
  unavailable: boolean;
};

/** For a server error or a lost connection alike: the staff can always take the payment. */
const ASK_STAFF = "Online payment isn't available right now, please ask the staff.";

const errorAnswer = (error: unknown) =>
  (error as { response?: { status?: number; data?: Partial<PaymentErrorBody> } } | null)?.response;

export const onlinePaymentStartProblem = (error: unknown): OnlinePaymentStartProblem => {
  const answer = errorAnswer(error);
  const code = answer?.data?.code;
  // ONLINE_PAYMENT_UNAVAILABLE, or any other conflict: the bill changed under the guest.
  if (answer?.status === 409) {
    return { message: errorMessage("ONLINE_PAYMENT_UNAVAILABLE"), unavailable: true };
  }
  if (answer?.status === 503 && code === "STRIPE_NOT_CONFIGURED") {
    return { message: errorMessage(code), unavailable: false };
  }
  return { message: ASK_STAFF, unavailable: false };
};
