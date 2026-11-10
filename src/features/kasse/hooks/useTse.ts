import { useCallback, useEffect, useRef, useState } from "react";
import type { TseStatus } from "../../../shared/api/payments";
import { announceFailedSignatures } from "../failedSignatureCount";
import { tseSetupProblem, type TseSetupProblem } from "../tseActivation";
import { fetchTse, setupTse } from "../tseApi";

/**
 * The restaurant's TSE and its activation. `activate` ignores a second call
 * while one is running, so a double click sends one request.
 */
export const useTse = () => {
  const [tse, setTse] = useState<TseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [activating, setActivating] = useState(false);
  const [problem, setProblem] = useState<TseSetupProblem | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const loaded = await fetchTse();
      if (mounted.current) {
        setTse(loaded);
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

  const activate = async () => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setActivating(true);
    setProblem(null);
    try {
      const activated = await setupTse();
      if (mounted.current) {
        setTse(activated);
      }
    } catch (error) {
      if (mounted.current) {
        setProblem(tseSetupProblem(error));
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setActivating(false);
      }
    }
  };

  const failedSignatures = tse?.active ? tse.failedSignatures : null;
  useEffect(() => {
    if (failedSignatures !== null) {
      announceFailedSignatures(failedSignatures);
    }
  }, [failedSignatures]);

  /** A retry signed one payment or order: one failure fewer. */
  const markSigned = useCallback(() => {
    setTse((current) =>
      current ? { ...current, failedSignatures: Math.max(0, current.failedSignatures - 1) } : current
    );
  }, []);

  return { tse, loading, loadFailed, reload: load, activating, problem, activate, markSigned };
};

export type TseState = ReturnType<typeof useTse>;
