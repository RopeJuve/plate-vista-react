import type { PayOnline } from "../../features/guest-ordering/hooks/usePayOnline";
import { formatCents } from "../../shared/money/formatCents";
import { Button } from "@/components/ui/button";

/** How the table can pay: online when the bill allows it, and always through the staff. */
const PayOnlineSection = ({ totalCents, payOnline }: { totalCents: number | null; payOnline: PayOnline }) => (
  <div className="mt-3 space-y-2">
    {totalCents !== null && (
      <Button type="button" size="xl" variant="ink" className="w-full" onClick={payOnline.start} disabled={payOnline.pending}>
        {`Pay online ${formatCents(totalCents)}`}
      </Button>
    )}
    {payOnline.message && (
      <p className="rounded-md bg-alert/10 px-3 py-2 text-center text-sm font-semibold text-alert-ink" role="alert">
        {payOnline.message}
      </p>
    )}
    <p className="text-center text-sm text-ink-soft">To pay with cash or card, ask the staff.</p>
  </div>
);

export default PayOnlineSection;
