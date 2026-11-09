import { useCallback, useEffect, useRef, useState } from "react";
import type { PaymentMethod } from "../../../shared/api/payments";
import type { SessionBill } from "../../../shared/realtime/protocol";
import { canRetryPayment, payProblem, reloadsBill, type PayProblem } from "../billPayment";
import { fetchBill, payBill } from "../paymentsApi";

export type PayRequest = { method: PaymentMethod; clientPaymentId: string; expectedTotalCents: number };

/**
 * A table's bill and recording its payment. `refreshKey` reloads the bill when
 * it changes (new orders on the board). `pay` ignores a call while one is
 * running, and resolves `true` once the confirm step is done with: paid, or a
 * problem that confirming again with the same id cannot fix.
 */
export const useRecordPayment = (sessionId: string, refreshKey?: unknown) => {
  const [bill, setBill] = useState<SessionBill | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [problem, setProblem] = useState<PayProblem | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoadFailed(false);
    try {
      const loaded = await fetchBill(sessionId);
      if (mounted.current) {
        setBill(loaded);
      }
    } catch {
      if (mounted.current) {
        setLoadFailed(true);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load, refreshKey]);

  const pay = async (request: PayRequest): Promise<boolean> => {
    if (inFlight.current) {
      return false;
    }
    inFlight.current = true;
    setPending(true);
    setProblem(null);
    try {
      const payment = await payBill(sessionId, request);
      if (mounted.current) {
        setBill((current) => (current ? { ...current, payment } : current));
      }
      return true;
    } catch (error) {
      const next = payProblem(error);
      if (mounted.current) {
        setProblem(next);
      }
      if (reloadsBill(next)) {
        await load();
      }
      return !canRetryPayment(next);
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setPending(false);
      }
    }
  };

  const clearProblem = useCallback(() => setProblem(null), []);

  return { bill, loading, loadFailed, reload: load, pending, problem, pay, clearProblem };
};

export type RecordPayment = ReturnType<typeof useRecordPayment>;
