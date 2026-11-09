import { useEffect } from "react";
import type { Payment } from "../../../shared/api/payments";
import { fetchBill } from "../../../shared/api/bill";

/**
 * Asks the server whether the guest's bill is already paid: when the table
 * opens, and again whenever `checkKey` changes (an order refused as paid).
 * `onPayment` hears the bill's payment, or null while it is unpaid. A failed
 * check says nothing and is left alone.
 */
export const useServerPayment = (
  sessionId: string,
  guestToken: string | undefined,
  checkKey: number,
  onPayment: (payment: Payment | null) => void
) => {
  useEffect(() => {
    if (!sessionId || !guestToken) {
      return;
    }
    let cancelled = false;
    fetchBill(sessionId, guestToken)
      .then((bill) => {
        if (!cancelled) {
          onPayment(bill.payment ?? null);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [sessionId, guestToken, checkKey, onPayment]);
};
