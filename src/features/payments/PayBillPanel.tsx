import { useEffect, useState } from "react";
import type { PaymentMethod } from "../../shared/api/payments";
import type { SessionBill } from "../../shared/realtime/protocol";
import { formatCents } from "../../shared/money/formatCents";
import { canPayBill, PAY_METHODS } from "./billPayment";
import ConfirmPaymentDialog from "./ConfirmPaymentDialog";
import { useRecordPayment } from "./hooks/useRecordPayment";
import PaidBill from "./PaidBill";
import PayProblemNote from "./PayProblemNote";
import { Button } from "@/components/ui/button";

type Confirming = { method: PaymentMethod; clientPaymentId: string };

/**
 * Settling a table's bill: its total and "paid in cash / by card", or how it was paid.
 * `canActivateTse` is true for an owner or admin, who can fix a missing TSE themselves.
 * `onBillChange` hears the bill as it loads and gets paid: `undefined` while loading, `null` if it failed.
 */
const PayBillPanel = ({
  sessionId,
  refreshKey,
  canActivateTse,
  onBillChange,
}: {
  sessionId: string;
  refreshKey?: unknown;
  canActivateTse: boolean;
  onBillChange?: (bill: SessionBill | null | undefined) => void;
}) => {
  const { bill, loading, loadFailed, reload, pending, problem, pay, clearProblem } = useRecordPayment(
    sessionId,
    refreshKey
  );
  useEffect(() => {
    onBillChange?.(loading ? undefined : loadFailed ? null : bill);
  }, [bill, loading, loadFailed, onBillChange]);

  // One id per confirm step: a retry after a network error replays the same payment.
  const [confirming, setConfirming] = useState<Confirming | null>(null);

  const handleChoose = (method: PaymentMethod) => {
    clearProblem();
    setConfirming({ method, clientPaymentId: crypto.randomUUID() });
  };

  const handleConfirm = async () => {
    if (!confirming || !bill) {
      return;
    }
    if (await pay({ ...confirming, expectedTotalCents: bill.totalCents })) {
      setConfirming(null);
    }
  };

  const handleCancel = () => {
    clearProblem();
    setConfirming(null);
  };

  if (loading) {
    return <p className="text-sm text-ink-soft">Loading the bill…</p>;
  }
  if (loadFailed || !bill) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p role="alert" className="text-sm font-semibold text-alert-ink">
          Could not load the bill.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={reload}>
          Reload
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PayProblemNote problem={problem} currentTotalCents={bill.totalCents} canActivateTse={canActivateTse} />
      {bill.payment ? (
        <PaidBill payment={bill.payment} />
      ) : (
        canPayBill(bill) && (
          <>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-sm font-bold uppercase tracking-[0.1em]">To pay</span>
              <span className="leader" aria-hidden="true" />
              <span className="text-lg font-bold tabular">{formatCents(bill.totalCents)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PAY_METHODS.map(({ method, button }) => (
                <Button
                  key={method}
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={() => handleChoose(method)}
                  disabled={pending}
                >
                  {button}
                </Button>
              ))}
            </div>
          </>
        )
      )}
      <ConfirmPaymentDialog
        method={confirming?.method ?? null}
        totalCents={bill.totalCents}
        pending={pending}
        problem={problem}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default PayBillPanel;
