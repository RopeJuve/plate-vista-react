/** The query parameter Stripe's return URLs carry back to the guest's table page. */
export const PAYMENT_PARAM = "payment";

/** `return`: the guest finished on Stripe. `cancelled`: they went back without paying. */
export type PaymentArrival = "RETURN" | "CANCELLED";

export const paymentArrival = (params: URLSearchParams): PaymentArrival | null => {
  switch (params.get(PAYMENT_PARAM)) {
    case "return":
      return "RETURN";
    case "cancelled":
      return "CANCELLED";
    default:
      return null;
  }
};

/** The same query without `?payment=`, so a reload does not handle it again. */
export const withoutPaymentParam = (params: URLSearchParams) => {
  const next = new URLSearchParams(params);
  next.delete(PAYMENT_PARAM);
  return next;
};

/** How often the guest page asks whether an online payment went through. */
export const CONFIRM_POLL_MS = 2_000;

/** How long it keeps asking before telling the guest to ask the staff. */
export const CONFIRM_WAIT_MS = 60_000;

const errorAnswer = (error: unknown) =>
  (error as { response?: { status?: number; data?: { code?: string } } } | null)?.response;

/**
 * Why going back from Stripe did not unfreeze the bill. `PAYING_ONLINE`: the payment
 * is already going through (paid in another tab), so wait for it. Anything else
 * leaves the page as it is; Stripe ends an abandoned payment on its own.
 */
export const cancelPaymentProblem = (error: unknown): "PAYING_ONLINE" | "OTHER" => {
  const answer = errorAnswer(error);
  return answer?.status === 409 && answer.data?.code === "BILL_PAYING_ONLINE" ? "PAYING_ONLINE" : "OTHER";
};
