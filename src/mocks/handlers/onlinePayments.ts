import { http, HttpResponse } from "msw";
import type {
  OnlinePaymentRefundList,
  OnlinePaymentStart,
  OnlinePaymentsSwitchBody,
  PayoutAccount,
  PayoutOnboardingLink,
  ReceiptTokenPaying,
} from "../../shared/api/payments";
import { lateRefunds, payoutAccounts } from "../fixtures/onlinePayments";
import { apiPaths } from "./paths";

/** How long the API keeps an online payment link open. */
const ONLINE_PAYMENT_MINUTES = 30;

/**
 * Where a mocked redirect goes: the app's own origin, so a `VITE_USE_MOCKS` dev run
 * never leaves for Stripe.
 */
const ownOrigin = (request: Request) => globalThis.location?.origin ?? new URL(request.url).origin;

/**
 * By default the Payout Account is ready with online payments on, every Late Payment is listed,
 * and an online payment the guest came back from is still going through.
 */
export const onlinePaymentHandlers = [
  http.post(apiPaths.payoutAccount, ({ request }) =>
    HttpResponse.json<PayoutOnboardingLink>({
      url: `${ownOrigin(request)}/admin/kasse?payout=return`,
    })
  ),
  http.get(apiPaths.payoutAccount, () => HttpResponse.json<PayoutAccount>(payoutAccounts.ready)),
  http.patch(apiPaths.payoutAccount, async ({ request }) => {
    const body = (await request.json()) as Partial<OnlinePaymentsSwitchBody>;
    if (typeof body?.onlinePaymentsEnabled !== "boolean") {
      return HttpResponse.json({ code: "VALIDATION" }, { status: 400 });
    }
    return HttpResponse.json<PayoutAccount>({
      ...payoutAccounts.ready,
      onlinePaymentsEnabled: body.onlinePaymentsEnabled,
    });
  }),
  http.get(apiPaths.onlinePaymentRefunds, ({ request }) => {
    const before = new URL(request.url).searchParams.get("before");
    const items = before ? lateRefunds.filter((refund) => refund.refundedAt < before) : lateRefunds;
    return HttpResponse.json<OnlinePaymentRefundList>({
      items,
      nextBefore: null,
    });
  }),
  http.post(apiPaths.onlinePayment, ({ params, request }) =>
    HttpResponse.json<OnlinePaymentStart>({
      url: `${ownOrigin(request)}/mock-online-payment/${encodeURIComponent(String(params.sessionId))}`,
      expiresAt: new Date(Date.now() + ONLINE_PAYMENT_MINUTES * 60_000).toISOString(),
    })
  ),
  http.post(apiPaths.cancelOnlinePayment, () => new HttpResponse(null, { status: 200 })),
  // The webhook has not arrived yet: tests pick the answer they need.
  http.get(apiPaths.receiptToken, () => HttpResponse.json<ReceiptTokenPaying>({ status: "PAYING" }, { status: 202 })),
];
