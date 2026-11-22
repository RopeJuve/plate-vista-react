import type { ReactNode } from "react";

/** One label and value of a receipt's field list, e.g. "Beleg-Nr" … "1042". */
export const ReceiptField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex gap-3">
    <dt className="shrink-0 text-ink-soft">{label}</dt>
    <dd className="ml-auto min-w-0 break-words text-right font-mono tabular">{children}</dd>
  </div>
);

export const ReceiptFields = ({ label, children }: { label?: string; children: ReactNode }) => (
  <dl aria-label={label} className="space-y-1 text-xs">
    {children}
  </dl>
);
