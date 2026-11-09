import { useEffect, useState } from "react";
import { fetchOpenSessionId } from "../tablesApi";

/** Looks up the open session at a table once; `sessionId` is null when the table is free. */
export const useOpenSession = (tableId: string | undefined) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(tableId));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!tableId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetchOpenSessionId(tableId)
      .then((id) => {
        if (!cancelled) {
          setSessionId(id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tableId]);

  return { sessionId, loading, failed };
};
