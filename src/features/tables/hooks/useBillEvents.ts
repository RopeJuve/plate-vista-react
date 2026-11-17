import { useEffect, useState } from "react";
import { useRealtime } from "../../../shared/realtime/RealtimeProvider";

/**
 * Counts the live events that change how a session's bill looks (frozen, unfrozen, paid),
 * so the admin dialog, which has no board behind it, can reload the bill when one is heard.
 */
export const useBillEvents = (sessionId: string | null | undefined) => {
  const { subscribe } = useRealtime();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    const bump = (data: { sessionId: string }) => {
      if (data.sessionId === sessionId) {
        setCount((current) => current + 1);
      }
    };
    const offs = [subscribe("bill.frozen", bump), subscribe("bill.unfrozen", bump), subscribe("bill.paid", bump)];
    return () => offs.forEach((off) => off());
  }, [sessionId, subscribe]);

  return count;
};
