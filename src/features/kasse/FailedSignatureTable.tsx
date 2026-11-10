import type { FailedSignature } from "../../shared/api/payments";
import FailedSignatureRow from "./FailedSignatureRow";
import { signatureKey } from "./failedSignatures";

type FailedSignatureTableProps = {
  rows: FailedSignature[];
  retrying: string[];
  stillFailing: string[];
  onRetry: (row: FailedSignature) => void;
};

const COLUMNS = [
  { label: "Type" },
  { label: "Table" },
  { label: "Date and time" },
  { label: "Amount", right: true },
  { label: "Error" },
  { label: "Attempts", right: true },
];

/** Payments and orders waiting for a signature: a table on desktop, stacked cards on a phone. */
const FailedSignatureTable = ({ rows, retrying, stillFailing, onRetry }: FailedSignatureTableProps) => (
  <table className="block w-full text-sm text-ink md:table">
    <thead className="hidden border-b border-paper-line md:table-header-group">
      <tr>
        {COLUMNS.map((column) => (
          <th
            key={column.label}
            scope="col"
            className={`px-3 pb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-soft ${column.right ? "text-right" : "text-left"}`}
          >
            {column.label}
          </th>
        ))}
        <th scope="col" className="px-3 pb-2">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
    <tbody className="block md:table-row-group">
      {rows.map((row) => {
        const key = signatureKey(row);
        return (
          <FailedSignatureRow
            key={key}
            row={row}
            retrying={retrying.includes(key)}
            stillFailing={stillFailing.includes(key)}
            onRetry={onRetry}
          />
        );
      })}
    </tbody>
  </table>
);

export default FailedSignatureTable;
