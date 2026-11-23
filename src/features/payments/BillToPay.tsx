import BillAmountRow from "./BillAmountRow";
import CardReaderFailure from "./CardReaderFailure";
import CardReaderStatus from "./CardReaderStatus";
import type { BillCardReader } from "./hooks/useBillCardReader";

/**
 * The head of an unpaid bill: the card reader payment in progress, the last one that failed
 * (with Retry), or just the total to pay.
 */
const BillToPay = ({
  totalCents,
  cardReader,
  onRetry,
}: {
  totalCents: number;
  cardReader: BillCardReader;
  onRetry: () => void;
}) => {
  if (cardReader.inProgress) {
    return (
      <CardReaderStatus
        payment={cardReader.inProgress}
        readerOnline={cardReader.readerOnline}
        pending={cardReader.pending}
        onPresentTestCard={(card) => void cardReader.presentCard(card)}
        onCancel={() => void cardReader.cancel()}
      />
    );
  }
  if (cardReader.failed) {
    return (
      <CardReaderFailure
        payment={cardReader.failed}
        totalCents={totalCents}
        pending={cardReader.pending}
        onRetry={onRetry}
      />
    );
  }
  return <BillAmountRow label="To pay" amountCents={totalCents} />;
};

export default BillToPay;
