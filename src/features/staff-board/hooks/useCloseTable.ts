import { useCallback, useState } from "react";
import { BILL_NOT_PAID, closeBlock, type CloseResult, type KnownBill } from "../closeTable";

type CloseDialog = "confirm" | "unpaid" | null;

/**
 * Closing a table from its check: which dialog is open, whether the bill lets it close,
 * and reloading the bill when the server says it is not paid after all.
 * `billRefreshKey` goes to the pay panel's `refreshKey`; `setBill` to its `onBillChange`.
 */
export const useCloseTable = (
  sessionId: string | undefined,
  closeSession: (sessionId: string, unpaidReason?: string) => Promise<CloseResult>
) => {
  const [known, setKnown] = useState<{ sessionId?: string; bill: KnownBill }>({ bill: undefined });
  const [billReloads, setBillReloads] = useState(0);
  const [dialog, setDialog] = useState<CloseDialog>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const bill = known.sessionId === sessionId ? known.bill : undefined;

  const setBill = useCallback(
    (next: KnownBill) => setKnown({ sessionId, bill: next }),
    [sessionId]
  );

  const close = async (unpaidReason?: string) => {
    if (!sessionId) {
      return;
    }
    setNotice(null);
    const result = await closeSession(sessionId, unpaidReason);
    if (result === "closed") {
      setDialog(null);
    } else if (result === "unpaid") {
      // A new order landed (or the bill was never paid): show the bill as it really is.
      setDialog(null);
      setNotice(BILL_NOT_PAID);
      setKnown({ sessionId, bill: undefined });
      setBillReloads((count) => count + 1);
    }
  };

  return {
    block: closeBlock(bill),
    notice,
    dialog,
    setDialog,
    close,
    setBill,
    billReloads,
  };
};
