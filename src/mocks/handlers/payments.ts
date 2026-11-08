import { http, HttpResponse } from "msw";
import type { CloseUnpaidBody, PayBillBody, Payment } from "../../shared/api/payments";
import { unpaidBill } from "../fixtures/bill";
import { closeUnpaidError, payment } from "../fixtures/payments";
import { apiPaths } from "./paths";

/** By default the bill is unpaid, paying succeeds (201), and closing needs an `unpaidReason`. */
export const paymentHandlers = [
  http.get(apiPaths.bill, ({ params }) =>
    HttpResponse.json({ ...unpaidBill, sessionId: String(params.sessionId) })
  ),
  http.post(apiPaths.pay, async ({ params, request }) => {
    const body = (await request.json()) as PayBillBody;
    const created: Payment = {
      ...payment,
      sessionId: String(params.sessionId),
      method: body.method,
      amountCents: body.expectedTotalCents,
    };
    return HttpResponse.json(created, { status: 201 });
  }),
  http.post(apiPaths.close, async ({ request }) => {
    const body = (await request.json().catch(() => null)) as Partial<CloseUnpaidBody> | null;
    if (!body?.unpaidReason) {
      return HttpResponse.json(closeUnpaidError, { status: 409 });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
