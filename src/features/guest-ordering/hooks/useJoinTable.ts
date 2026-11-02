import { useCallback, useEffect, useRef, useState } from "react";
import { useGuestAuth } from "../GuestAuthContext";
import { joinTable } from "../guestSession";
import { joinFailureMessage } from "../joinMessages";

export type JoinState = "loading" | "needsCode" | "wrongCode" | "joining" | "joined";

/**
 * Getting a guest from a QR scan to a seat at the table. Joins as soon as the
 * scan's slug and code are known; `join(code)` retries with a join code.
 * `error` is set when no code can help and the guest must ask for help.
 */
export const useJoinTable = (slug: string, qrCode: string) => {
  const { setSession } = useGuestAuth();
  const [error, setError] = useState("");
  const [joinState, setJoinState] = useState<JoinState>("loading");
  const cancelledRef = useRef(false);

  const join = useCallback(
    async (joinCode?: string) => {
      setError("");
      setJoinState(joinCode ? "joining" : "loading");
      const result = await joinTable(slug, qrCode, joinCode);
      if (cancelledRef.current) {
        return;
      }
      if (result.status === "joined") {
        setSession(result.session);
        setJoinState("joined");
        return;
      }
      if (result.status === "needsCode" || result.status === "wrongCode") {
        setJoinState(result.status);
        return;
      }
      setError(joinFailureMessage(result));
    },
    [qrCode, setSession, slug]
  );

  useEffect(() => {
    cancelledRef.current = false;
    if (slug && qrCode) {
      void join();
    }
    return () => {
      cancelledRef.current = true;
    };
  }, [join, qrCode, slug]);

  return { joinState, error, join };
};
