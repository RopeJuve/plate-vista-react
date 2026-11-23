import { useEffect, useState } from "react";
import type { PaymentMethod } from "../../shared/api/payments";
import type { BillUnfrozenReason, SessionBill } from "../../shared/realtime/protocol";
import { formatCents } from "../../shared/money/formatCents";
import { canPayBill, isGuestPayingOnline, PAY_METHODS } from "./billPayment";
import CardReaderButton from "./CardReaderButton";
import CardReaderFailure from "./CardReaderFailure";
import { cardReaderFailed, cardReaderInProgress, cardReaderOption, readerOnline } from "./cardReaderPayment";
import CardReaderStatus from "./CardReaderStatus";
import ConfirmPaymentDialog from "./ConfirmPaymentDialog";
import FrozenBill from "./FrozenBill";
import { useCardReaderEndNote } from "./hooks/useCardReaderEndNote";
import { useCardReaderPayment } from "./hooks/useCardReaderPayment";
import { useLastCardReader } from "./hooks/useLastCardReader";
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
  const cardReader = useCardReaderPayment(sessionId, showCardReaderPayment, reload, handleCancelled);
  const readerPayment = bill ? cardReaderInProgress(bill) : null;
  const endNote = useCardReaderEndNote(Boolean(readerPayment), unfrozenReason);
  const { lastReaderId, remember: rememberReader } = useLastCardReader();
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
  const failedPayment = readerPayment ? null : cardReaderFailed(bill);
  // A failed attempt is retried on its own reader, so there is no second way to start one.
  const readerOption = readerPayment || failedPayment ? null : cardReaderOption(bill);

  const handleStartCardReader = (readerId: string) => {
    clearProblem();
    rememberReader(readerId);
    void cardReader.start(readerId, bill.totalCents);
  };

  const handleRetryCardReader = () => {
    clearProblem();
    void cardReader.retry(bill.totalCents);
  };

  return (
    <div className="space-y-3">
      {payingOnline && <FrozenBill sessionId={sessionId} canUnfreeze={canUnfreeze} onUnfrozen={reload} />}
      <PayProblemNote problem={problem} currentTotalCents={bill.totalCents} canActivateTse={canActivateTse} />
      {endNote && !readerPayment && (
        <p role="status" className="rounded-md bg-signal/10 px-3 py-2 text-sm font-semibold text-signal-ink">
          {endNote}
        </p>
      )}
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
                readerOnline={readerOnline(bill, readerPayment)}
                pending={cardReader.pending}
                onPresentTestCard={(card) => void cardReader.presentCard(card)}
                onCancel={() => void cardReader.cancel()}
              />
            ) : failedPayment ? (
              <CardReaderFailure
                payment={failedPayment}
                totalCents={bill.totalCents}
                pending={cardReader.pending}
                onRetry={handleRetryCardReader}
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
                <CardReaderButton
                  option={readerOption}
                  lastReaderId={lastReaderId}
                  pending={cardReader.pending}
                  onStart={handleStartCardReader}
                  onRefresh={() => void reload()}
                />
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
        payingOnCardReader={Boolean(readerPayment)}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default PayBillPanel;
