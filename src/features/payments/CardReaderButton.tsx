import type { CardReaderOption } from "./cardReaderPayment";
import { Button } from "@/components/ui/button";

/** "Card reader" on the pay panel: starts on the offered reader, or greyed out with why it can't. */
const CardReaderButton = ({
  option,
  pending,
  onStart,
}: {
  option: CardReaderOption;
  pending: boolean;
  onStart: (readerId: string) => void;
}) => (
  <div className="col-span-2 space-y-1">
    <Button
      type="button"
      size="lg"
      variant="outline"
      className="w-full"
      disabled={pending || !option.available}
      onClick={() => option.available && onStart(option.reader.id)}
    >
      Card reader
    </Button>
    {!option.available && <p className="text-xs text-ink-soft">{option.reason}</p>}
  </div>
);

export default CardReaderButton;
