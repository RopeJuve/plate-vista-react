import type { CardReaderPayment } from "../../../shared/api/payments";
import type { BillUnfrozenReason, SessionBill } from "../../../shared/realtime/protocol";
import { cardReaderFailed, cardReaderInProgress } from "../cardReaderAttempt";
import { cardReaderOption, readerOnline } from "../cardReaderAvailability";
import { useCardReaderEndNote } from "./useCardReaderEndNote";
import { useCardReaderPayment } from "./useCardReaderPayment";
import { useLastCardReader } from "./useLastCardReader";

/**
 * The card reader part of a bill's pay panel: the attempt in progress or the last failed one, the
 * readers staff can start on (also after a failure, to try a different reader), the note left when an
 * attempt ends unpaid, and the requests that start, retry and cancel it. Starting remembers the reader
 * on this device so the picker preselects it next time.
 */
export const useBillCardReader = ({
  sessionId,
  bill,
  reload,
  onStarted,
  onCancelled,
  unfrozenReason,
}: {
  sessionId: string;
  bill: SessionBill | null;
  reload: () => unknown;
  onStarted: (payment: CardReaderPayment) => void;
  onCancelled: () => void;
  unfrozenReason: BillUnfrozenReason | null | undefined;
}) => {
  const requests = useCardReaderPayment(sessionId, onStarted, reload, onCancelled);
  const inProgress = bill ? cardReaderInProgress(bill) : null;
  const endNote = useCardReaderEndNote(Boolean(inProgress), unfrozenReason);
  const { lastReaderId, remember } = useLastCardReader();

  const start = (readerId: string) => {
    if (bill) {
      remember(readerId);
      void requests.start(readerId, bill.totalCents);
    }
  };

  const retry = () => {
    if (bill) {
      void requests.retry(bill.totalCents);
    }
  };

  return {
    ...requests,
    inProgress,
    failed: bill && !inProgress ? cardReaderFailed(bill) : null,
    // A new start is allowed after a failure too, so staff can switch to another reader instead of Retry.
    option: bill && !inProgress ? cardReaderOption(bill) : null,
    readerOnline: bill && inProgress ? readerOnline(bill, inProgress) : null,
    endNote: inProgress ? null : endNote,
    lastReaderId,
    start,
    retry,
  };
};

export type BillCardReader = ReturnType<typeof useBillCardReader>;
