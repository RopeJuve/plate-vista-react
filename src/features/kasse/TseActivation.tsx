import type { TseSetupProblem } from "./tseActivation";
import { Button } from "@/components/ui/button";

type TseActivationProps = {
  legalComplete: boolean;
  activating: boolean;
  problem: TseSetupProblem | null;
  onActivate: () => void;
};

const LegalDetailsLink = () => (
  <a href="#legal-details" className="font-bold text-ink underline underline-offset-2">
    legal details
  </a>
);

/** Switching the TSE on, or why it cannot be switched on yet. */
const TseActivation = ({ legalComplete, activating, problem, onActivate }: TseActivationProps) => {
  const failed = problem === "FAILED";

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        German law requires every order and payment to be signed by a TSE. Activation takes a few seconds.
      </p>
      {!legalComplete && (
        <p className="text-sm text-ink">
          The TSE is registered to your business, so fill in the legal details above and save them first.
        </p>
      )}
      {problem === "DETAILS_MISSING" && (
        <p role="alert" className="text-sm text-red-700">
          The TSE needs your <LegalDetailsLink /> first. Complete and save them, then activate again.
        </p>
      )}
      {failed && (
        <p role="alert" className="text-sm text-red-700">
          Could not activate the TSE right now. Your progress is kept, so trying again picks up where it stopped.
        </p>
      )}
      <Button
        type="button"
        onClick={onActivate}
        disabled={!legalComplete || activating}
        className="w-full sm:w-auto"
      >
        {activating ? "Activating TSE…" : failed ? "Try again" : "Activate TSE"}
      </Button>
    </div>
  );
};

export default TseActivation;
