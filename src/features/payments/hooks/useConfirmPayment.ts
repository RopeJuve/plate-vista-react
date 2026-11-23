import { useState } from "react";
import type { PaymentMethod } from "../../../shared/api/payments";
import type { PayRequest } from "./useRecordPayment";

type Confirming = { method: PaymentMethod; clientPaymentId: string };

/**
 * The confirm step for "paid in cash / by card": which method is being confirmed, with one payment id
 * per confirm step so a retry after a network error replays the same payment. `clearProblem` (the
 * payment problem) runs when staff choose a method or back out; the step closes once `pay` is done with it.
 */
export const useConfirmPayment = (
  totalCents: number | null,
  pay: (request: PayRequest) => Promise<boolean>,
  clearProblem: () => void
) => {
  const [confirming, setConfirming] = useState<Confirming | null>(null);

  const choose = (method: PaymentMethod) => {
    clearProblem();
    setConfirming({ method, clientPaymentId: crypto.randomUUID() });
  };

  const confirm = async () => {
    if (!confirming || totalCents === null) {
      return;
    }
    if (await pay({ ...confirming, expectedTotalCents: totalCents })) {
      setConfirming(null);
    }
  };

  const cancel = () => {
    clearProblem();
    setConfirming(null);
  };

  return { method: confirming?.method ?? null, choose, confirm, cancel };
};
