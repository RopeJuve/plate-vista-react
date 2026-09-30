import { cn } from "@/lib/utils";

/**
 * Plate Vista mark: a plate seen from above, with the order chit tucked under
 * its rim. Drawn in currentColor so it works on steel and on paper.
 */
export const PlateMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden="true">
    <rect x="17" y="3" width="11" height="15" rx="1" fill="hsl(var(--signal))" />
    <path d="M19.5 7h6M19.5 10h6M19.5 13h4" stroke="hsl(var(--ink))" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="14" cy="18" r="11" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="14" cy="18" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
  </svg>
);

const Wordmark = ({ className, compact = false }: { className?: string; compact?: boolean }) => (
  <span className={cn("inline-flex items-center gap-2 text-current", className)}>
    <PlateMark />
    {!compact && (
      <span
        className="text-[1.05rem] font-extrabold uppercase leading-none tracking-[-0.01em]"
        style={{ fontVariationSettings: '"wdth" 118' }}
      >
        Plate Vista
      </span>
    )}
    {compact && <span className="sr-only">Plate Vista</span>}
  </span>
);

export default Wordmark;
