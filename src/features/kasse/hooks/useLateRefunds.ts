import { useCallback, useEffect, useRef, useState } from "react";
import type { OnlinePaymentRefund } from "../../../shared/api/payments";
import { useRealtime } from "../../../shared/realtime/RealtimeProvider";
import { withNewerRefund, withOlderRefunds } from "../lateRefunds";
import { fetchOnlinePaymentRefunds } from "../payoutAccountApi";

/**
 * Late Payments the API refunded, newest first: the first page on mount, older pages on
 * `showMore`, and live `online_payment.refunded` events on top while the page is open.
 */
export const useLateRefunds = () => {
  const { subscribe } = useRealtime();
  const [rows, setRows] = useState<OnlinePaymentRefund[]>([]);
  const [nextBefore, setNextBefore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);
  const mounted = useRef(true);
  const fetchingMore = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const page = await fetchOnlinePaymentRefunds();
      if (mounted.current) {
        // A live refund heard while the first page loaded stays on top.
        setRows((current) => current.reduceRight(withNewerRefund, page.items));
        setNextBefore(page.nextBefore);
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
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  useEffect(
    () => subscribe("online_payment.refunded", ({ refund }) => setRows((current) => withNewerRefund(current, refund))),
    [subscribe]
  );

  const showMore = useCallback(async () => {
    if (!nextBefore || fetchingMore.current) {
      return;
    }
    fetchingMore.current = true;
    setLoadingMore(true);
    setMoreFailed(false);
    try {
      const page = await fetchOnlinePaymentRefunds({ before: nextBefore });
      if (mounted.current) {
        setRows((current) => withOlderRefunds(current, page.items));
        setNextBefore(page.nextBefore);
      }
    } catch {
      if (mounted.current) {
        setMoreFailed(true);
      }
    } finally {
      fetchingMore.current = false;
      if (mounted.current) {
        setLoadingMore(false);
      }
    }
  }, [nextBefore]);

  return { rows, loading, loadFailed, reload: load, hasMore: nextBefore !== null, showMore, loadingMore, moreFailed };
};
