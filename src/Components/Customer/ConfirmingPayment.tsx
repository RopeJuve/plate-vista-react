import { PlateMark, Wordmark } from "../rail";
import { Button } from "@/components/ui/button";

/** The full screen a guest sees back from paying online, until the restaurant hears the payment went through. */
const ConfirmingPayment = ({ timedOut, onCheckAgain }: { timedOut: boolean; onCheckAgain: () => void }) => (
  <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-paper px-6 text-center text-ink">
    <Wordmark className="mb-10 text-ink" />
    {timedOut ? (
      <div className="flex max-w-sm flex-col items-center gap-6">
        <p className="text-xl font-bold" role="alert">
          We couldn&apos;t confirm your payment yet. Please ask the staff.
        </p>
        <Button type="button" variant="ink" className="h-11 px-6" onClick={onCheckAgain}>
          Check again
        </Button>
      </div>
    ) : (
      <div className="flex max-w-sm flex-col items-center gap-4" role="status">
        <PlateMark className="h-10 w-10 animate-spin [animation-duration:1.8s]" />
        <p className="text-xl font-bold">Confirming your payment…</p>
        <p className="text-sm text-ink-soft">This usually takes a few seconds. Please keep this page open.</p>
      </div>
    )}
  </div>
);

export default ConfirmingPayment;
