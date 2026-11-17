import { Button } from "@/components/ui/button";

type PayoutSetupPanelProps = {
  /** True once onboarding was started: the owner continues instead of starting. */
  started: boolean;
  starting: boolean;
  failed: boolean;
  onStart: () => void;
};

/** Sending the owner to Stripe to set up, or finish setting up, online payments. */
const PayoutSetupPanel = ({ started, starting, failed, onStart }: PayoutSetupPanelProps) => (
  <div className="space-y-4">
    {started ? (
      <div className="space-y-1">
        <p className="text-sm font-bold text-ink">{"Setup isn't finished"}</p>
        <p className="text-sm text-ink-soft">Pick up on Stripe where you left off.</p>
      </div>
    ) : (
      <p className="text-sm text-ink-soft">
        Guests can pay their bill online. The money goes straight to your own Stripe account; Stripe checks your
        identity and bank account once.
      </p>
    )}
    {failed && (
      <p role="alert" className="text-sm text-red-700">
        {"We couldn't open Stripe right now. Please try again."}
      </p>
    )}
    <Button type="button" onClick={onStart} disabled={starting} className="w-full sm:w-auto">
      {starting ? "Opening Stripe…" : started ? "Continue setup" : "Set up online payments"}
    </Button>
  </div>
);

export default PayoutSetupPanel;
