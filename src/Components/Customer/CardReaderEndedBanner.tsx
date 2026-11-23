import { X } from "lucide-react";

/** Tells the table the card reader payment ended without being paid, and why; the bill is open again. */
const CardReaderEndedBanner = ({ note, onDismiss }: { note: string; onDismiss: () => void }) => (
  <div className="mx-auto mt-3 w-full max-w-3xl px-4 sm:px-6" role="status">
    <div className="flex items-center gap-x-4 rounded-lg bg-signal/10 px-4 py-3 text-ink">
      <p className="min-w-0 flex-1 font-semibold">{note}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  </div>
);

export default CardReaderEndedBanner;
