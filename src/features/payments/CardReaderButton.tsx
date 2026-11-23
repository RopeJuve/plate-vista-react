import { useState } from "react";
import { preselectedReaderId, type CardReaderOption } from "./cardReaderPayment";
import CardReaderPicker from "./CardReaderPicker";
import { Button } from "@/components/ui/button";

/**
 * "Card reader" on the pay panel: starts on the picked reader, or greyed out with why it can't.
 * With several readers a picker lists them, preselecting the one this device used last.
 */
const CardReaderButton = ({
  option,
  lastReaderId,
  pending,
  onStart,
  onRefresh,
}: {
  option: CardReaderOption;
  lastReaderId: string | null;
  pending: boolean;
  onStart: (readerId: string) => void;
  /** Reads the readers' online/offline status again (it has no realtime event). */
  onRefresh: () => void;
}) => {
  const [picked, setPicked] = useState<string | null>(null);
  const readerId = preselectedReaderId(option.readers, picked ?? lastReaderId);
  const canStart = option.available && readerId !== null;

  return (
    <div className="col-span-2 space-y-1">
      {option.readers.length > 1 && (
        <CardReaderPicker readers={option.readers} selectedId={readerId}
          disabled={pending || !option.available}
          onSelect={setPicked} />
      )}
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="w-full"
        disabled={pending || !canStart}
        onClick={() => canStart && onStart(readerId)}
      >
        Card reader
      </Button>
      {!option.available && <p className="text-xs text-ink-soft">{option.reason}</p>}
      {option.readers.length > 0 && (
        <Button type="button" size="sm" variant="ghost" onClick={onRefresh}>
          Refresh status
        </Button>
      )}
    </div>
  );
};

export default CardReaderButton;
