import { useEffect, useState } from "react";
import type { Receipt, SignatureStatus } from "../../../shared/api/payments";
import { useRealtime } from "../../../shared/realtime/RealtimeProvider";
import { isReceiptMissing, receiptPollDelay } from "../receipt";
import { fetchReceipt } from "../receiptApi";

export type ReceiptState =
  | { phase: "loading" }
  | { phase: "missing" }
  | { phase: "failed" }
  /** `waitedMs`: how long the page had been open when this receipt arrived. */
  | { phase: "ready"; receipt: Receipt; waitedMs: number };

/**
 * The guest's receipt, fetched again until the TSE has signed it (2 s, then 30 s;
 * see `receiptPollDelay`). A `payment.signed` event for this receipt fetches it
 * at once, when a realtime connection is around.
 */
export const useReceipt = (token: string) => {
  const { subscribe } = useRealtime();
  const [state, setState] = useState<ReceiptState>({ phase: "loading" });

  useEffect(() => {
    const openedAt = Date.now();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let latestLoad = 0;
    let lastStatus: SignatureStatus | null = null;

    const schedule = (delay: number | null) => {
      clearTimeout(timer);
      if (delay !== null) {
        timer = setTimeout(load, delay);
      }
    };

    // Only the newest fetch may schedule the next one, so an event during a poll never doubles the polling.
    async function load() {
      clearTimeout(timer);
      const thisLoad = ++latestLoad;
      try {
        const receipt = await fetchReceipt(token);
        if (cancelled || thisLoad !== latestLoad) {
          return;
        }
        const waitedMs = Date.now() - openedAt;
        lastStatus = receipt.signature.status;
        setState({ phase: "ready", receipt, waitedMs });
        schedule(receiptPollDelay(lastStatus, waitedMs));
      } catch (error) {
        if (cancelled || thisLoad !== latestLoad) {
          return;
        }
        if (isReceiptMissing(error)) {
          setState({ phase: "missing" });
          return;
        }
        setState((current) => (current.phase === "ready" ? current : { phase: "failed" }));
        // A failed fetch says nothing about the signature: keep the last cadence, or the slow one.
        schedule(receiptPollDelay(lastStatus ?? "FAILED", Date.now() - openedAt));
      }
    }

    void load();
    const unsubscribe = subscribe("payment.signed", (data) => {
      if (data.receiptToken === token && lastStatus !== "SIGNED") {
        void load();
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribe();
    };
  }, [token, subscribe]);

  return state;
};
