import type { FailedSignature } from "../../shared/api/payments";
import { formatCents } from "../../shared/money/formatCents";
import { failedKindLabel, formatFailedAt } from "./failedSignatures";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FailedSignatureRowProps = {
  row: FailedSignature;
  retrying: boolean;
  stillFailing: boolean;
  onRetry: (row: FailedSignature) => void;
};

/** On a phone each cell names its column, since the table header is hidden there. */
const Cell = ({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) => (
  <td className={cn("flex items-baseline justify-between gap-3 py-1 md:table-cell md:px-3 md:py-3", className)}>
    <span aria-hidden="true" className="text-xs font-bold uppercase tracking-[0.08em] text-ink-soft md:hidden">
      {label}
    </span>
    {children}
  </td>
);

/** One payment or order the TSE has not signed yet, with the button that tries again. */
const FailedSignatureRow = ({ row, retrying, stillFailing, onRetry }: FailedSignatureRowProps) => (
  <tr className="mb-3 block rounded-lg p-3 ring-1 ring-ink/[0.07] md:mb-0 md:table-row md:rounded-none md:p-0 md:ring-0 md:[&:not(:last-child)]:border-b md:border-paper-line">
    <Cell label="Type">
      <span className="font-semibold text-ink">{failedKindLabel(row.kind)}</span>
    </Cell>
    <Cell label="Table">
      <span className="font-mono tabular-nums">{row.tableNumber}</span>
    </Cell>
    <Cell label="Date and time">
      <span className="font-mono tabular-nums">{formatFailedAt(row.at)}</span>
    </Cell>
    <Cell label="Amount" className="md:text-right">
      <span className="font-mono tabular-nums">{formatCents(row.amountCents)}</span>
    </Cell>
    <Cell label="Error">
      <span className="min-w-0 text-right md:text-left">
        <span className="block break-words">{row.error}</span>
        {stillFailing && <span className="block text-xs font-bold text-alert-ink">Still failing</span>}
      </span>
    </Cell>
    <Cell label="Attempts" className="md:text-right">
      <span className="font-mono tabular-nums">{row.retryCount}</span>
    </Cell>
    <td className="block pt-2 md:table-cell md:px-3 md:py-3 md:text-right">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={retrying}
        aria-busy={retrying}
        onClick={() => onRetry(row)}
        className="w-full md:w-auto"
      >
        {retrying ? "Retrying…" : "Retry"}
      </Button>
    </td>
  </tr>
);

export default FailedSignatureRow;
