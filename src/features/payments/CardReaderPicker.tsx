import { useId } from "react";
import type { ReaderChoice } from "./cardReaderAvailability";
import { cn } from "@/lib/utils";

/** The restaurant's card readers as radios; ones that can't take a payment are listed greyed out with why. */
const CardReaderPicker = ({
  readers,
  selectedId,
  disabled,
  onSelect,
}: {
  readers: ReaderChoice[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (readerId: string) => void;
}) => {
  // One radio group per picker, so two pay panels on screen don't share their radios.
  const name = useId();
  return (
    <div role="radiogroup" aria-label="Card reader to use" className="space-y-1">
      {readers.map(({ reader, selectable, note }) => (
        <label
          key={reader.id}
          className={cn(
            "flex items-baseline gap-2 rounded-md border border-rule px-3 py-2 text-sm",
            selectable ? "cursor-pointer" : "text-ink-soft"
          )}
        >
          <input
            type="radio"
            name={name}
            value={reader.id}
            checked={selectedId === reader.id}
            disabled={disabled || !selectable}
            onChange={() => onSelect(reader.id)}
          />
          <span className="font-semibold">{reader.name}</span>
          {note && <span className="text-xs">{note}</span>}
        </label>
      ))}
    </div>
  );
};

export default CardReaderPicker;
