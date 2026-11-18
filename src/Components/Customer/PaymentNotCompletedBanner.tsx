import { AlertCircle } from "lucide-react";

/** Tells a guest back from the payment page that their online payment didn't go through, so the bill is still open. */
const PaymentNotCompletedBanner = () => (
  <div className="mx-auto mt-3 w-full max-w-3xl px-4 sm:px-6" role="status">
    <div className="flex items-center gap-x-4 rounded-lg bg-alert/10 px-4 py-3 text-ink">
      <AlertCircle className="h-5 w-5 shrink-0 text-alert-ink" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">Payment not completed</p>
        <p className="text-sm text-ink-soft">Nothing was charged. You can try again or pay through the staff.</p>
      </div>
    </div>
  </div>
);

export default PaymentNotCompletedBanner;
