import { useCallback, useEffect, useRef, useState } from "react";
import type { FailedSignature } from "../../../shared/api/payments";
import { apiMessage } from "../../../utils/notify";
import { signatureKey, withFailedAttempt, withoutSignature } from "../failedSignatures";
import { fetchFailedSignatures, retryFailedSignature } from "../tseApi";

const RETRY_FAILED = "Could not retry the signature. Please try again.";

/**
 * Payments and orders the TSE could not sign, and a retry per row.
 * `onSigned` runs once for every row a retry signed.
 */
export const useFailedSignatures = (onSigned: () => void) => {
  const [rows, setRows] = useState<FailedSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retrying, setRetrying] = useState<string[]>([]);
  const [stillFailing, setStillFailing] = useState<string[]>([]);
  const [retryError, setRetryError] = useState<string | null>(null);
  const mounted = useRef(true);
  const inFlight = useRef(new Set<string>());

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const loaded = await fetchFailedSignatures();
      if (mounted.current) {
        setRows(loaded);
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

  const retry = async ({ kind, id }: FailedSignature) => {
    const key = signatureKey({ kind, id });
    if (inFlight.current.has(key)) {
      return;
    }
    inFlight.current.add(key);
    setRetrying((current) => [...current, key]);
    setRetryError(null);
    try {
      const { status } = await retryFailedSignature(kind, id);
      if (!mounted.current) {
        return;
      }
      if (status === "SIGNED") {
        setRows((current) => withoutSignature(current, kind, id));
        setStillFailing((current) => current.filter((other) => other !== key));
        onSigned();
      } else {
        setRows((current) => withFailedAttempt(current, kind, id));
        setStillFailing((current) => (current.includes(key) ? current : [...current, key]));
      }
    } catch (error) {
      if (mounted.current) {
        setRetryError(apiMessage(error, RETRY_FAILED));
      }
    } finally {
      inFlight.current.delete(key);
      if (mounted.current) {
        setRetrying((current) => current.filter((other) => other !== key));
      }
    }
  };

  return { rows, loading, loadFailed, reload: load, retrying, stillFailing, retryError, retry };
};

export type FailedSignaturesState = ReturnType<typeof useFailedSignatures>;
