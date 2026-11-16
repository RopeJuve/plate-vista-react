import api from "../../services/api";
import type {
  OnlinePaymentRefundList,
  OnlinePaymentsSwitchBody,
  PayoutAccount,
  PayoutOnboardingLink,
} from "../../shared/api/payments";

const PAYOUT_ACCOUNT = "/restaurant/payout-account";

/**
 * `POST /restaurant/payout-account` → Stripe-hosted onboarding link. Owner only.
 * The Kasse page shows its own errors, so the client's generic toast stays off.
 */
export const startPayoutOnboarding = async () =>
  (
    await api.post<PayoutOnboardingLink>(PAYOUT_ACCOUNT, undefined, {
      skipErrorToast: true,
    })
  ).data;

export const fetchPayoutAccount = async () =>
  (await api.get<PayoutAccount>(PAYOUT_ACCOUNT, { skipErrorToast: true })).data;

/** The owner's switch for online payments. */
export const setOnlinePaymentsEnabled = async (onlinePaymentsEnabled: boolean) =>
  (
    await api.patch<PayoutAccount>(PAYOUT_ACCOUNT, { onlinePaymentsEnabled } satisfies OnlinePaymentsSwitchBody, {
      skipErrorToast: true,
    })
  ).data;

/** Late Payment refunds, newest first. Pass the previous page's `nextBefore` to go further back. */
export const fetchOnlinePaymentRefunds = async ({ before }: { before?: string } = {}) =>
  (
    await api.get<OnlinePaymentRefundList>("/restaurant/online-payment-refunds", {
      params: before ? { before } : undefined,
      skipErrorToast: true,
    })
  ).data;
