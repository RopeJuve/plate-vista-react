import { useEffect } from "react";
import type { PaymentMethod } from "../../shared/api/payments";
import type { BillUnfrozenReason, SessionBill } from "../../shared/realtime/protocol";
import BillLoadFailed from "./BillLoadFailed";
import { canPayBill, isGuestPayingOnline } from "./billPayment";
import BillToPay from "./BillToPay";
import CardReaderNotes from "./CardReaderNotes";
import ConfirmPaymentDialog from "./ConfirmPaymentDialog";
import FrozenBill from "./FrozenBill";
import { useBillCardReader } from "./hooks/useBillCardReader";
import { useConfirmPayment } from "./hooks/useConfirmPayment";
import { useRecordPayment } from "./hooks/useRecordPayment";
import PaidBill from "./PaidBill";
import PayMethodButtons from "./PayMethodButtons";
import PayProblemNote from "./PayProblemNote";

/**
 * Settling a table's bill: its total and "paid in cash / by card", or how it was paid.
 * `canActivateTse` is true for an owner or admin, who can fix a missing TSE themselves;
 * `canUnfreeze` lets them cancel a guest's online payment in progress.
 * `onBillChange` hears the bill as it loads and gets paid: `undefined` while loading, `null` if it failed.
 * `unfrozenReason` is the last `bill.unfrozen` heard for this bill since it last froze, so a card reader
 * payment that ends unpaid leaves a note saying why.
 */
const PayBillPanel = ({
  sessionId,
  refreshKey,
  canActivateTse,
  canUnfreeze = false,
  onBillChange,
  unfrozenReason,
}: {
  sessionId: string;
  refreshKey?: unknown;
  canActivateTse: boolean;
  canUnfreeze?: boolean;
  onBillChange?: (bill: SessionBill | null | undefined) => void;
  unfrozenReason?: BillUnfrozenReason | null;
}) => {
  const {
    bill,
    loading,
    loadFailed,
    reload,
    pending,
    problem,
    pay,
    clearProblem,
    showCardReaderPayment,
    clearCardReaderPayment,
  } = useRecordPayment(sessionId, refreshKey);
  const handleCancelled = () => {
    clearCardReaderPayment();
    void reload();
  };
  const cardReader = useBillCardReader({
    sessionId,
    bill,
    reload,
    onStarted: showCardReaderPayment,
    onCancelled: handleCancelled,
    unfrozenReason,
  });
  const confirming = useConfirmPayment(bill?.totalCents ?? null, pay, clearProblem);
  useEffect(() => {
    onBillChange?.(loading ? undefined : loadFailed ? null : bill);
  }, [bill, loading, loadFailed, onBillChange]);

  if (loading) {
    return <p className="text-sm text-ink-soft">Loading the bill…</p>;
  }
  if (loadFailed || !bill) {
    return <BillLoadFailed onReload={reload} />;
  }

  const payingOnline = isGuestPayingOnline(bill);
  // Each way to pay drops the problem the last one left.
  const handleChoose = (method: PaymentMethod) => {
    cardReader.clearProblem();
    confirming.choose(method);
  };
  const handleStartCardReader = (readerId: string) => {
    clearProblem();
    cardReader.start(readerId);
  };
  const handleRetryCardReader = () => {
    clearProblem();
    cardReader.retry();
  };

  return (
    <div className="space-y-3">
      {payingOnline && <FrozenBill sessionId={sessionId} canUnfreeze={canUnfreeze} onUnfrozen={reload} />}
      <PayProblemNote problem={problem} currentTotalCents={bill.totalCents} canActivateTse={canActivateTse} />
      <CardReaderNotes endNote={cardReader.endNote} problem={cardReader.problem} />
      {bill.payment ? (
        <PaidBill payment={bill.payment} />
      ) : (
        canPayBill(bill) && (
          <>
            <BillToPay totalCents={bill.totalCents} cardReader={cardReader} onRetry={handleRetryCardReader} />
            <PayMethodButtons
              pending={pending}
              cardReader={cardReader}
              onChoose={handleChoose}
              onStartCardReader={handleStartCardReader}
              onRefreshReaders={() => void reload()}
            />
          </>
        )
      )}
      <ConfirmPaymentDialog
        method={confirming.method}
        totalCents={bill.totalCents}
        pending={pending}
        problem={problem}
        payingOnline={payingOnline}
        payingOnCardReader={Boolean(cardReader.inProgress)}
        onCancel={confirming.cancel}
        onConfirm={confirming.confirm}
      />
    </div>
  );
};

export default PayBillPanel;
