import { useEffect, useState } from "react";
import { useRealtime } from "../../../shared/realtime/RealtimeProvider";
import type { BillUnfrozenReason } from "../../../shared/realtime/protocol";

/**
 * Counts the live events that change how a session's bill looks (frozen, unfrozen, paid),
 * so the admin dialog, which has no board behind it, can reload the bill when one is heard.
 * `unfrozenReason` is why the bill last opened again, until it freezes again.
 */
export const useBillEvents = (sessionId: string | null | undefined) => {
  const { subscribe } = useRealtime();
  const [count, setCount] = useState(0);
  const [unfrozenReason, setUnfrozenReason] = useState<BillUnfrozenReason | null>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    const bump = (data: { sessionId: string }) => {
      if (data.sessionId === sessionId) {
        setCount((current) => current + 1);
      }
    };
    const offs = [
      subscribe("bill.frozen", (data) => {
        if (data.sessionId === sessionId) {
          setUnfrozenReason(null);
        }
        bump(data);
      }),
      subscribe("bill.unfrozen", (data) => {
        if (data.sessionId === sessionId) {
          setUnfrozenReason(data.reason ?? null);
        }
        bump(data);
      }),
      subscribe("bill.paid", bump),
    ];
    return () => offs.forEach((off) => off());
  }, [sessionId, subscribe]);

  return { count, unfrozenReason };
};
