import type { PaymentMethod } from "../../shared/api/payments";
import { PAY_METHODS } from "./billPayment";
import CardReaderButton from "./CardReaderButton";
import type { BillCardReader } from "./hooks/useBillCardReader";
import { Button } from "@/components/ui/button";

/** "Paid in cash", "Paid by card" and, when the bill offers it, "Card reader" with its picker. */
const PayMethodButtons = ({
  pending,
  cardReader,
  onChoose,
  onStartCardReader,
  onRefreshReaders,
}: {
  pending: boolean;
  cardReader: BillCardReader;
  onChoose: (method: PaymentMethod) => void;
  onStartCardReader: (readerId: string) => void;
  onRefreshReaders: () => void;
}) => (
  <div className="grid grid-cols-2 gap-2">
    {PAY_METHODS.map(({ method, button }) => (
      <Button key={method} type="button" size="lg" variant="outline" onClick={() => onChoose(method)} disabled={pending}>
        {button}
      </Button>
    ))}
    {cardReader.option && (
      <CardReaderButton
        option={cardReader.option}
        lastReaderId={cardReader.lastReaderId}
        pending={cardReader.pending}
        onStart={onStartCardReader}
        onRefresh={onRefreshReaders}
      />
    )}
  </div>
);

export default PayMethodButtons;
