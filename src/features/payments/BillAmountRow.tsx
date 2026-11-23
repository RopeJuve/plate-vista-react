import type { ReactNode } from "react";
import { formatCents } from "../../shared/money/formatCents";

/** A label, a dotted leader and an amount on one line: "To pay ······ 42,50 €", or the reader taking it. */
const BillAmountRow = ({ label, amountCents, children }: { label: string; amountCents: number; children?: ReactNode }) => (
  <div className="flex items-baseline gap-2 font-mono">
    <span className="text-sm font-bold uppercase tracking-[0.1em]">{label}</span>
    {children}
    <span className="leader" aria-hidden="true" />
    <span className="text-lg font-bold tabular">{formatCents(amountCents)}</span>
  </div>
);

export default BillAmountRow;
