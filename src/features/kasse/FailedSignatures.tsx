import { useFailedSignatures } from "./hooks/useFailedSignatures";
import FailedSignatureTable from "./FailedSignatureTable";
import { failedSignatureBadge } from "./failedSignatures";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Receipts and orders the TSE could not sign, so the owner can have them signed again. */
const FailedSignatures = ({ count, onSigned }: { count: number; onSigned: () => void }) => {
  const { rows, loading, loadFailed, reload, retrying, stillFailing, retryError, retry } =
    useFailedSignatures(onSigned);
  const badge = failedSignatureBadge(count);

  const body = () => {
    if (loading) {
      return <p className="text-sm text-ink-soft">Loading…</p>;
    }
    if (loadFailed) {
      return (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-alert-ink">
            Could not load the failed signatures.
          </p>
          <Button type="button" variant="outline" onClick={reload} className="w-full sm:w-auto">
            Reload list
          </Button>
        </div>
      );
    }
    if (rows.length === 0) {
      return <p className="text-sm text-ink-soft">All receipts and orders are signed</p>;
    }
    return <FailedSignatureTable rows={rows} retrying={retrying} stillFailing={stillFailing} onRetry={retry} />;
  };

  return (
    <div className="space-y-3 border-t border-paper-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold text-ink">Failed signatures</h3>
        <span
          data-testid="failed-signatures-badge"
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em]",
            badge.tone === "ok" ? "bg-pass/15 text-pass-ink" : "bg-alert/15 text-alert-ink"
          )}
        >
          {badge.label}
        </span>
      </div>
      {retryError && (
        <p role="alert" className="text-sm text-alert-ink">
          {retryError}
        </p>
      )}
      {body()}
    </div>
  );
};

export default FailedSignatures;
