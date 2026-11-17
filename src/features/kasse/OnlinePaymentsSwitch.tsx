import { cn } from "@/lib/utils";

type OnlinePaymentsSwitchProps = {
  enabled: boolean;
  saving: boolean;
  /** The value a failed save tried to set, so the message can say what did not happen. */
  failedTo: boolean | null;
  onChange: (enabled: boolean) => void;
};

/** The owner's switch that lets guests pay their bill online, or stops it. */
const OnlinePaymentsSwitch = ({ enabled, saving, failedTo, onChange }: OnlinePaymentsSwitchProps) => (
  <div className="space-y-3">
    <p className="text-sm font-bold text-ink">Online payments are ready</p>
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
      <span className="text-sm text-ink">Let guests pay online</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Let guests pay online"
        disabled={saving}
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60",
          enabled ? "bg-pass" : "bg-ink/20"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </label>
    {failedTo !== null && (
      <p role="alert" className="text-sm text-red-700">
        {`We couldn't switch online payments ${failedTo ? "on" : "off"}. Please try again.`}
      </p>
    )}
  </div>
);

export default OnlinePaymentsSwitch;
