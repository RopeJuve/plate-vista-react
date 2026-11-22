import { CreditCard } from "lucide-react";

/** Tells the table the staff are taking the bill on a card reader, so nothing can change on it meanwhile. */
const CardReaderBillBanner = () => (
  <div className="mx-auto mt-3 w-full max-w-3xl px-4 sm:px-6" role="status">
    <div className="flex items-center gap-x-4 rounded-lg bg-signal/10 px-4 py-3 text-ink">
      <CreditCard className="h-5 w-5 shrink-0 text-signal-ink" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">Your bill is being paid on the card reader.</p>
        <p className="text-sm text-ink-soft">Ordering is paused until the payment is done.</p>
      </div>
    </div>
  </div>
);

export default CardReaderBillBanner;
