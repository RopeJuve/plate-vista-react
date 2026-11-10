import { useTse } from "./hooks/useTse";
import TseActivation from "./TseActivation";
import TseActiveDetails from "./TseActiveDetails";
import FailedSignatures from "./FailedSignatures";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The TSE that signs every order and payment; without it the restaurant cannot take payments. */
const TseSection = ({ legalComplete }: { legalComplete: boolean }) => {
  const { tse, loading, loadFailed, reload, activating, problem, activate, markSigned } = useTse();
  const active = Boolean(tse?.active);

  const body = () => {
    if (loading) {
      return <p className="text-sm text-ink-soft">Loading…</p>;
    }
    if (loadFailed || !tse) {
      return (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-red-700">
            Could not load the TSE status.
          </p>
          <Button type="button" variant="outline" onClick={reload} className="w-full sm:w-auto">
            Reload
          </Button>
        </div>
      );
    }
    if (active) {
      return (
        <div className="space-y-6">
          <TseActiveDetails tse={tse} />
          <FailedSignatures count={tse.failedSignatures} onSigned={markSigned} />
        </div>
      );
    }
    return (
      <TseActivation legalComplete={legalComplete} activating={activating} problem={problem} onActivate={activate} />
    );
  };

  return (
    <section aria-labelledby="tse-title" className="max-w-2xl rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="tse-title" className="text-lg font-bold text-ink">
          TSE
        </h2>
        {!loading && tse && (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em]",
              active ? "bg-pass/15 text-pass-ink" : "bg-ink/[0.06] text-ink-soft"
            )}
          >
            {active ? "Active" : "Not active"}
          </span>
        )}
      </div>
      {body()}
    </section>
  );
};

export default TseSection;
