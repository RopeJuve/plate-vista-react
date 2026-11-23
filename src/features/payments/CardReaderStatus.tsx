import type { CardReaderPayment } from "../../shared/api/payments";
import { formatCents } from "../../shared/money/formatCents";
import { Button } from "@/components/ui/button";

/**
 * A card reader payment in progress: which reader, how much, and that it waits for the card.
 * Cancel stops it and the panel goes back to the payment choice.
 * A Simulated Reader (test mode only) gets a developer button that presents an approved test card.
 */
const CardReaderStatus = ({
  payment,
  readerOnline,
  pending,
  onPresentTestCard,
  onCancel,
}: {
  payment: CardReaderPayment;
  /** The reader's online/offline status as the bill last reported it; `null` hides it. */
  readerOnline: boolean | null;
  pending: boolean;
  onPresentTestCard: () => void;
  onCancel: () => void;
}) => (
  <section aria-label="Card reader payment" className="space-y-2 rounded-lg bg-signal/10 px-4 py-3">
    <div className="flex items-baseline gap-2 font-mono">
      <span className="text-sm font-bold uppercase tracking-[0.1em]">{payment.reader.name}</span>
      {readerOnline !== null && (
        <span className={`text-xs font-semibold ${readerOnline ? "text-ink-soft" : "text-alert-ink"}`}>
          {readerOnline ? "Online" : "Offline"}
        </span>
      )}
      <span className="leader" aria-hidden="true" />
      <span className="text-lg font-bold tabular">{formatCents(payment.amountCents)}</span>
    </div>
    <p role="status" className="text-sm font-semibold text-ink">
      Waiting for card
    </p>
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={pending}>
        Cancel
      </Button>
      {payment.reader.simulated && (
        <Button type="button" size="sm" variant="outline" onClick={onPresentTestCard} disabled={pending}>
          Present test card
        </Button>
      )}
    </div>
  </section>
);

export default CardReaderStatus;
