import type { PayoutAccount } from "../../shared/api/payments";

/** Where the owner is on the way to online payments, from never started to ready. */
export type PayoutAccountStage = "NOT_CONNECTED" | "UNFINISHED" | "UNDER_REVIEW" | "READY";

export const payoutAccountStage = (account: PayoutAccount): PayoutAccountStage => {
  if (account.chargesEnabled) {
    return "READY";
  }
  if (account.detailsSubmitted) {
    return "UNDER_REVIEW";
  }
  return account.connected ? "UNFINISHED" : "NOT_CONNECTED";
};

/** Why a Payout Account request failed: this server has no Stripe keys, or anything worth retrying. */
export type PayoutProblem = "NOT_CONFIGURED" | "FAILED";

const errorAnswer = (error: unknown) =>
  (error as { response?: { status?: number; data?: { code?: string } } } | null)?.response;

export const payoutProblem = (error: unknown): PayoutProblem => {
  const answer = errorAnswer(error);
  return answer?.status === 503 && answer.data?.code === "STRIPE_NOT_CONFIGURED" ? "NOT_CONFIGURED" : "FAILED";
};

/** The query parameter Stripe's return URLs carry back to the Kasse page. */
export const PAYOUT_PARAM = "payout";

/** `return`: the owner left Stripe's form. `refresh`: the link expired and needs a fresh one. */
export type PayoutReturn = "RETURN" | "REFRESH";

export const payoutReturn = (params: URLSearchParams): PayoutReturn | null => {
  switch (params.get(PAYOUT_PARAM)) {
    case "return":
      return "RETURN";
    case "refresh":
      return "REFRESH";
    default:
      return null;
  }
};
