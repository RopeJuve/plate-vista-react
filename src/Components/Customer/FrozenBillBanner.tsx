import { CreditCard } from "lucide-react";
import { usePayOnline } from "../../features/guest-ordering/hooks/usePayOnline";
import { Button } from "@/components/ui/button";

/** Tells the table someone is paying the bill online, so nothing can change on it, and lets anyone finish that payment. */
const FrozenBillBanner = () => {
  const payOnline = usePayOnline();

  return (
    <div className="mx-auto mt-3 w-full max-w-3xl px-4 sm:px-6" role="status">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-signal/10 px-4 py-3 text-ink">
        <CreditCard className="h-5 w-5 shrink-0 text-signal-ink" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">Someone at your table is paying online.</p>
          <p className="text-sm text-ink-soft">Ordering is paused until the payment is done.</p>
        </div>
        <Button type="button" variant="ink" className="h-10" onClick={payOnline.start} disabled={payOnline.pending}>
          Continue to payment
        </Button>
        {payOnline.message && (
          <p className="w-full text-sm font-semibold text-alert-ink" role="alert">
            {payOnline.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FrozenBillBanner;
