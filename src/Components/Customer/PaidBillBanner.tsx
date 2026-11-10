import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import type { PaidBill } from "../../features/guest-ordering/billState";
import { receiptPath } from "../../features/payments/billPayment";

/** Tells the table its bill is settled, so the menu is for looking only, and where the receipt is. */
const PaidBillBanner = ({ paid }: { paid: PaidBill }) => (
  <div className="mx-auto mt-3 w-full max-w-3xl px-4 sm:px-6" role="status">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-pass/10 px-4 py-3 text-ink">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-pass-ink" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">This bill is paid</p>
        <p className="text-sm text-ink-soft">Nothing more can be ordered on it.</p>
      </div>
      {paid.receiptToken && (
        <Link
          to={receiptPath(paid.receiptToken)}
          className="inline-flex h-10 items-center rounded-md bg-ink px-4 text-sm font-bold text-paper hover:bg-ink/85"
        >
          View receipt
        </Link>
      )}
    </div>
  </div>
);

export default PaidBillBanner;
