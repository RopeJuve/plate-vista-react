import { useEffect } from "react";
import { fetchBill } from "../../../shared/api/bill";
import type { SessionBill } from "../../../shared/realtime/protocol";

/**
 * Reads the guest's bill from the server: when the table opens, and again
 * whenever `checkKey` changes (an order refused as paid or frozen, a bill
 * unfrozen, online payment refused). `onBill` hears what the server says
 * about paying it. A failed read says nothing and is left alone.
 */
export const useServerBill = (
  sessionId: string,
  guestToken: string | undefined,
  checkKey: number,
  onBill: (bill: SessionBill) => void
) => {
  useEffect(() => {
    if (!sessionId || !guestToken) {
      return;
    }
    let cancelled = false;
    fetchBill(sessionId, guestToken)
      .then((bill) => {
        if (!cancelled) {
          onBill(bill);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [sessionId, guestToken, checkKey, onBill]);
};
