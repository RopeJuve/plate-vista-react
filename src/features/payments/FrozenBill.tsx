import { useState } from "react";
import { PAID_ONLINE_MESSAGE } from "./billPayment";
import { useUnfreezeBill } from "./hooks/useUnfreezeBill";
import UnfreezeBillDialog from "./UnfreezeBillDialog";
import { Button } from "@/components/ui/button";

/**
 * A bill a guest is paying online right now: the "Paying online" badge and, for an owner
 * or admin, the way to unfreeze it. `onUnfrozen` reloads the bill.
 */
const FrozenBill = ({
  sessionId,
  canUnfreeze,
  onUnfrozen,
}: {
  sessionId: string;
  canUnfreeze: boolean;
  onUnfrozen: () => unknown;
}) => {
  const { pending, paidOnline, unfreeze } = useUnfreezeBill(sessionId, onUnfrozen);
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    if (await unfreeze()) {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded bg-signal px-2 py-1 text-xs font-bold uppercase tracking-[0.1em] text-ink">
          Paying online
        </span>
        {canUnfreeze && !paidOnline && (
          <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)} disabled={pending}>
            Unfreeze bill
          </Button>
        )}
      </div>
      {paidOnline && (
        <p role="status" className="text-sm font-semibold text-ink">
          {PAID_ONLINE_MESSAGE}
        </p>
      )}
      <UnfreezeBillDialog
        open={confirming}
        pending={pending}
        onCancel={() => setConfirming(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default FrozenBill;
