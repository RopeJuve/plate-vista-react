import { useCallback, useEffect, useState } from "react";
import { useRealtime } from "../../../shared/realtime/RealtimeProvider";
import { notify } from "../../../utils/notify";

export type WaiterCallState = "idle" | "calling" | "called";

/**
 * The table's waiter call. Anyone at the table can call; everyone at it sees a
 * waiter is on the way until staff answer. The server repeats an open call when
 * the socket connects, so a reloaded page shows it too.
 */
export const useCallWaiter = (sessionId: string) => {
  const { subscribe, request } = useRealtime();
  const [state, setState] = useState<WaiterCallState>("idle");

  useEffect(() => {
    const offCalled = subscribe("waiter.called", (data) => {
      if (data.sessionId === sessionId) {
        setState("called");
      }
    });
    const offDismissed = subscribe("waiter.dismissed", (data) => {
      if (data.sessionId === sessionId) {
        setState("idle");
      }
    });
    return () => {
      offCalled();
      offDismissed();
    };
  }, [sessionId, subscribe]);

  const call = useCallback(() => {
    setState("calling");
    request("waiter.call", {})
      .then(() => setState("called"))
      .catch(() => {
        setState("idle");
        notify("Couldn't call a waiter. Please try again.", "error");
      });
  }, [request]);

  return { state, call };
};
