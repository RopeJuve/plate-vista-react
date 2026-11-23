import type { CardReaderPayment } from "../../shared/api/payments";
import BillAmountRow from "./BillAmountRow";
import { cardReaderFailureTitle } from "./cardReaderAttempt";
import { Button } from "@/components/ui/button";

/**
 * A card reader attempt that failed: the reader, why (in staff words, with the server's sentence),
 * and the bill's current total, which Retry asks for on the same reader. Cash and card stay below it.
 */
const CardReaderFailure = ({
  payment,
  totalCents,
  pending,
  onRetry,
}: {
  payment: CardReaderPayment;
  totalCents: number;
  pending: boolean;
  onRetry: () => void;
}) => {
  const title = cardReaderFailureTitle(payment.failure);
  const sentence = payment.failure?.message;
  return (
    <section aria-label="Card reader payment" className="space-y-2 rounded-lg bg-alert/10 px-4 py-3">
      <BillAmountRow label={payment.reader.name} amountCents={totalCents} />
      <div role="alert" className="text-sm text-alert-ink">
        <p className="font-semibold">{title}</p>
        {sentence && sentence !== title && <p>{sentence}</p>}
      </div>
      <Button type="button" size="sm" variant="outline" onClick={onRetry} disabled={pending}>
        Retry
      </Button>
    </section>
  );
};

export default CardReaderFailure;
