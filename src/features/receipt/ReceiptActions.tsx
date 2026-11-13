import { Check, Link2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCopyLink } from "./hooks/useCopyLink";

/** Puts the link in focus, selected, so the guest only has to copy it. */
const selectOnMount = (input: HTMLInputElement | null) => {
  input?.focus();
  input?.select();
};

/** Print/PDF and copy-link buttons under the receipt; never printed themselves. */
const ReceiptActions = ({ className }: { className?: string }) => {
  const url = window.location.href;
  const { state, copy } = useCopyLink(url);

  return (
    <div role="group" aria-label="Beleg teilen" className={cn("print:hidden space-y-3", className)}>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="ink" onClick={() => window.print()}>
          <Printer aria-hidden="true" />
          Drucken / als PDF speichern
        </Button>
        <Button type="button" variant="outline" onClick={() => void copy()}>
          <Link2 aria-hidden="true" />
          Link kopieren
        </Button>
      </div>
      {state === "copied" && (
        <p role="status" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-pass-ink">
          <Check className="h-4 w-4" aria-hidden="true" />
          Link kopiert
        </p>
      )}
      {state === "manual" && (
        <label className="block space-y-1 text-sm">
          <span className="text-ink-soft">Link zum Beleg</span>
          <input
            readOnly
            value={url}
            ref={selectOnMount}
            onFocus={(event) => event.currentTarget.select()}
            className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs"
          />
        </label>
      )}
    </div>
  );
};

export default ReceiptActions;
