import { useCallback, useEffect, useRef, useState } from "react";
import { apiMessage, notify } from "../../../utils/notify";
import { billPayingOnline } from "../billPayment";
import { cancelOnlinePayment } from "../onlinePaymentApi";

/**
 * Unfreezing a bill a guest is paying online: cancels their online payment so the table
 * can order and pay at the table again. `onDone` reloads the bill afterwards. When the
 * guest's payment got there first, `paidOnline` turns true and the bill waits for
 * `bill.paid` instead of showing an error. Resolves `true` once the confirm step is done with.
 */
export const useUnfreezeBill = (sessionId: string, onDone: () => unknown) => {
  const [pending, setPending] = useState(false);
  const [paidOnline, setPaidOnline] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const unfreeze = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) {
      return false;
    }
    inFlight.current = true;
    setPending(true);
    try {
      await cancelOnlinePayment(sessionId);
      void onDone();
      return true;
    } catch (error) {
      if (billPayingOnline(error)) {
        if (mounted.current) {
          setPaidOnline(true);
        }
        void onDone();
        return true;
      }
      notify(apiMessage(error, "Could not unfreeze the bill"));
      return false;
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setPending(false);
      }
    }
  }, [onDone, sessionId]);

  return { pending, paidOnline, unfreeze };
};

export type UnfreezeBill = ReturnType<typeof useUnfreezeBill>;
