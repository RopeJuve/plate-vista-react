import { useCallback, useEffect, useRef, useState } from "react";
import type { PayoutAccount } from "../../../shared/api/payments";
import { payoutProblem, type PayoutProblem } from "../payoutAccountStage";
import { fetchPayoutAccount, setOnlinePaymentsEnabled, startPayoutOnboarding } from "../payoutAccountApi";

/**
 * The owner's Payout Account: its status, the trip to Stripe's onboarding, and the
 * online payments switch. `startSetup` ignores a second call while one is running,
 * so a double click sends one request.
 */
export const usePayoutAccount = () => {
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadProblem, setLoadProblem] = useState<PayoutProblem | null>(null);
  const [starting, setStarting] = useState(false);
  const [startProblem, setStartProblem] = useState<PayoutProblem | null>(null);
  const [switching, setSwitching] = useState(false);
  /** The value the owner tried to switch to when the PATCH failed. */
  const [switchFailedTo, setSwitchFailedTo] = useState<boolean | null>(null);
  const starts = useRef(false);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadProblem(null);
    try {
      const loaded = await fetchPayoutAccount();
      if (mounted.current) {
        setAccount(loaded);
      }
    } catch (error) {
      if (mounted.current) {
        setLoadProblem(payoutProblem(error));
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

  /** Asks the API for a Stripe onboarding link and sends the browser there. */
  const startSetup = useCallback(async () => {
    if (starts.current) {
      return;
    }
    starts.current = true;
    setStarting(true);
    setStartProblem(null);
    try {
      const { url } = await startPayoutOnboarding();
      window.location.assign(url);
    } catch (error) {
      starts.current = false;
      if (mounted.current) {
        setStartProblem(payoutProblem(error));
        setStarting(false);
      }
    }
  }, []);

  /** Optimistic: the switch moves at once and moves back if the API says no. */
  const switchOnlinePayments = async (enabled: boolean) => {
    if (!account || switching) {
      return;
    }
    const before = account;
    setAccount({ ...account, onlinePaymentsEnabled: enabled });
    setSwitchFailedTo(null);
    setSwitching(true);
    try {
      const saved = await setOnlinePaymentsEnabled(enabled);
      if (mounted.current) {
        setAccount(saved);
      }
    } catch {
      if (mounted.current) {
        setAccount(before);
        setSwitchFailedTo(enabled);
      }
    } finally {
      if (mounted.current) {
        setSwitching(false);
      }
    }
  };

  const unavailable = loadProblem === "NOT_CONFIGURED" || startProblem === "NOT_CONFIGURED";

  return {
    account,
    loading,
    loadFailed: loadProblem === "FAILED",
    unavailable,
    reload: load,
    starting,
    startFailed: startProblem === "FAILED",
    startSetup,
    switching,
    switchFailedTo,
    switchOnlinePayments,
  };
};

export type PayoutAccountState = ReturnType<typeof usePayoutAccount>;
