import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/** The top of a table's check: which table, its seats and join code, and the toggle that opens the sheet on phones. */
const CheckHeader = ({
  tableNumber,
  capacity,
  joinCode,
  sheetOpen,
  onToggleSheet,
}: {
  tableNumber?: number;
  capacity?: number;
  joinCode?: string;
  sheetOpen: boolean;
  onToggleSheet: () => void;
}) => (
  <header className="flex items-center gap-3 px-5 pb-3 pt-4">
    <h2 id="check-title" className="text-2xl font-black tracking-[-0.02em]">
      {`Table ${tableNumber ?? ""}`.trim()}
    </h2>
    {capacity ? (
      <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">{capacity} seats</span>
    ) : null}
    {joinCode ? (
      <span className="rounded bg-ink/[0.06] px-2 py-1 font-mono text-xs font-bold tracking-[0.15em]">
        <span className="sr-only">Join code </span>
        {joinCode}
      </span>
    ) : null}
    <button
      type="button"
      className="ml-auto grid h-10 w-10 place-items-center rounded-md bg-ink/[0.06] lg:hidden"
      onClick={onToggleSheet}
      aria-expanded={sheetOpen}
      aria-controls="check-lines"
      aria-label={sheetOpen ? "Hide check" : "Show check"}
    >
      <ChevronUp className={cn("h-5 w-5 transition-transform", sheetOpen && "rotate-180")} />
    </button>
  </header>
);

export default CheckHeader;
