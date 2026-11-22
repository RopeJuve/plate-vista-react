import { useEffect, useState } from "react";
import type { PaymentMethod } from "../../shared/api/payments";
import type { SessionBill } from "../../shared/realtime/protocol";
import { formatCents } from "../../shared/money/formatCents";
import { canPayBill, isGuestPayingOnline, PAY_METHODS } from "./billPayment";
import CardReaderButton from "./CardReaderButton";
import { cardReaderInProgress, cardReaderOption } from "./cardReaderPayment";
import CardReaderStatus from "./CardReaderStatus";
import ConfirmPaymentDialog from "./ConfirmPaymentDialog";
import FrozenBill from "./FrozenBill";
import { useCardReaderPayment } from "./hooks/useCardReaderPayment";
import { useRecordPayment } from "./hooks/useRecordPayment";
import PaidBill from "./PaidBill";
import PayProblemNote from "./PayProblemNote";
import { Button } from "@/components/ui/button";

type Confirming = { method: PaymentMethod; clientPaymentId: string };

/**
 * Settling a table's bill: its total and "paid in cash / by card", or how it was paid.
 * `canActivateTse` is true for an owner or admin, who can fix a missing TSE themselves;
 * `canUnfreeze` lets them cancel a guest's online payment in progress.
 * `onBillChange` hears the bill as it loads and gets paid: `undefined` while loading, `null` if it failed.
 */
const PayBillPanel = ({
  sessionId,
  refreshKey,
  canActivateTse,
  canUnfreeze = false,
  onBillChange,
}: {
  sessionId: string;
  refreshKey?: unknown;
  canActivateTse: boolean;
  canUnfreeze?: boolean;
  onBillChange?: (bill: SessionBill | null | undefined) => void;
}) => {
  const { bill, loading, loadFailed, reload, pending, problem, pay, clearProblem, showCardReaderPayment } =
    useRecordPayment(sessionId, refreshKey);
  const cardReader = useCardReaderPayment(sessionId, showCardReaderPayment, reload);
  useEffect(() => {
    onBillChange?.(loading ? undefined : loadFailed ? null : bill);
  }, [bill, loading, loadFailed, onBillChange]);

  // One id per confirm step: a retry after a network error replays the same payment.
  const [confirming, setConfirming] = useState<Confirming | null>(null);

  const handleChoose = (method: PaymentMethod) => {
    clearProblem();
    cardReader.clearProblem();
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

  const payingOnline = isGuestPayingOnline(bill);
  const readerPayment = cardReaderInProgress(bill);
  const readerOption = readerPayment ? null : cardReaderOption(bill);

  const handleStartCardReader = (readerId: string) => {
    clearProblem();
    void cardReader.start(readerId, bill.totalCents);
  };

  return (
    <div className="space-y-3">
      {payingOnline && <FrozenBill sessionId={sessionId} canUnfreeze={canUnfreeze} onUnfrozen={reload} />}
      <PayProblemNote problem={problem} currentTotalCents={bill.totalCents} canActivateTse={canActivateTse} />
      {cardReader.problem && (
        <p role="alert" className="text-sm font-semibold text-alert-ink">
          {cardReader.problem}
        </p>
      )}
      {bill.payment ? (
        <PaidBill payment={bill.payment} />
      ) : (
        canPayBill(bill) && (
          <>
            {readerPayment ? (
              <CardReaderStatus
                payment={readerPayment}
                pending={cardReader.pending}
                onPresentTestCard={() => void cardReader.approveTestCard()}
              />
            ) : (
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-sm font-bold uppercase tracking-[0.1em]">To pay</span>
                <span className="leader" aria-hidden="true" />
                <span className="text-lg font-bold tabular">{formatCents(bill.totalCents)}</span>
              </div>
            )}
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
              {readerOption && (
                <CardReaderButton option={readerOption} pending={cardReader.pending} onStart={handleStartCardReader} />
              )}
            </div>
          </>
        )
      )}
      <ConfirmPaymentDialog
        method={confirming?.method ?? null}
        totalCents={bill.totalCents}
        pending={pending}
        problem={problem}
        payingOnline={payingOnline}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default PayBillPanel;
