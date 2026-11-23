import type { CardReaderPayment, TestCard } from "../../shared/api/payments";
import { formatCents } from "../../shared/money/formatCents";
import { DECLINED_TEST_CARDS } from "./cardReaderPayment";
import { Button } from "@/components/ui/button";

/**
 * A card reader payment in progress: which reader, how much, and that it waits for the card.
 * Cancel stops it and the panel goes back to the payment choice.
 * A Simulated Reader (test mode only) gets developer buttons that present an approved test card
 * or one of the declined ones.
 */
const CardReaderStatus = ({
  payment,
  pending,
  onPresentTestCard,
  onCancel,
}: {
  payment: CardReaderPayment;
  pending: boolean;
  onPresentTestCard: (card: TestCard) => void;
  onCancel: () => void;
}) => (
  <section aria-label="Card reader payment" className="space-y-2 rounded-lg bg-signal/10 px-4 py-3">
    <div className="flex items-baseline gap-2 font-mono">
      <span className="text-sm font-bold uppercase tracking-[0.1em]">{payment.reader.name}</span>
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
        <Button type="button" size="sm" variant="outline" onClick={() => onPresentTestCard("APPROVED")} disabled={pending}>
          Present test card
        </Button>
      )}
    </div>
    {payment.reader.simulated && (
      <div role="group" aria-label="Declined test cards" className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">Declined test cards</span>
        {DECLINED_TEST_CARDS.map(({ card, label }) => (
          <Button
            key={card}
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onPresentTestCard(card)}
            disabled={pending}
          >
            {label}
          </Button>
        ))}
      </div>
    )}
  </section>
);

export default CardReaderStatus;
