import { Trash2 } from "lucide-react";
import type { CardReader } from "../../shared/api/payments";
import { deviceName } from "./cardReaders";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** One card reader at the restaurant: its name, which device it is, and whether it can take a payment now. */
const CardReaderRow = ({ reader, onRemove }: { reader: CardReader; onRemove: (reader: CardReader) => void }) => {
  const nameId = `card-reader-${reader.id}`;
  const online = reader.status === "online";

  return (
    <li aria-labelledby={nameId} className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0 space-y-0.5">
        <p id={nameId} className="truncate text-sm font-bold text-ink">
          {reader.name}
        </p>
        <p className="text-xs text-ink-soft">{deviceName(reader.deviceType)}</p>
        {reader.busyWith && (
          <p className="text-xs font-semibold text-ink">Taking payment · Table {reader.busyWith.tableNumber}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em]",
            online ? "bg-pass/15 text-pass-ink" : "bg-ink/[0.06] text-ink-soft"
          )}
        >
          {online ? "Online" : "Offline"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remove ${reader.name}`}
          onClick={() => onRemove(reader)}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </li>
  );
};

export default CardReaderRow;
