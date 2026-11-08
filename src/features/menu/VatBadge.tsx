import type { VatRate } from "../../shared/api/payments";
import { vatBadge } from "./categoryVat";
import { cn } from "@/lib/utils";

/** The VAT rate a category's items are sold at, as a small tag. */
const VatBadge = ({ rate, className }: { rate: VatRate; className?: string }) => (
  <span
    title="VAT rate"
    className={cn(
      "shrink-0 rounded bg-paper-deep px-1.5 py-0.5 font-mono text-[0.7rem] font-bold tabular text-ink-soft",
      className
    )}
  >
    {vatBadge(rate)}
  </span>
);

export default VatBadge;
