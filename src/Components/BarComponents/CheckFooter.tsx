import { useOrder } from "../../contexts/OrderContext";
import { countItems, linesTotalCents } from "../../features/guest-ordering/cartLines";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import type { PlaceOrder } from "../../features/guest-ordering/hooks/usePlaceOrder";
import { PLACE_ORDER_LABEL } from "../../features/guest-ordering/placeOrderStatus";
import { formatCents } from "../../shared/money/formatCents";
import { TotalLine } from "../rail";
import { Button } from "@/components/ui/button";

/** The foot of a table's check: what the unsent lines add, the running total, and the two ways out. */
const CheckFooter = ({
  totalCents,
  canSend,
  canClose,
  placeOrder,
  onCloseTable,
}: {
  totalCents: number;
  canSend: boolean;
  canClose: boolean;
  placeOrder: PlaceOrder;
  onCloseTable: () => void;
}) => {
  const { pad } = useOrder();
  const { itemsById } = useMenu();
  const padCount = countItems(pad);

  return (
    <footer className="space-y-3 border-t border-dashed border-ink/20 px-5 pb-5 pt-3">
      {padCount > 0 && (
        <div className="flex items-baseline gap-2 font-mono text-sm text-signal-ink">
          <span>New · {padCount}</span>
          <span className="leader" aria-hidden="true" />
          <span className="tabular">{formatCents(linesTotalCents(pad, itemsById))}</span>
        </div>
      )}
      <TotalLine label="Total" cents={totalCents} strong className="text-xl" />
      {!canSend && (
        <p className="text-sm font-semibold text-signal-ink" role="status">
          Connecting…
        </p>
      )}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button
          type="button"
          size="xl"
          onClick={placeOrder.place}
          disabled={!placeOrder.canPlace}
          title={canSend ? "" : "Connecting…"}
        >
          {PLACE_ORDER_LABEL.staff[placeOrder.phase]}
        </Button>
        <Button
          type="button"
          size="xl"
          variant="outline"
          className="border-ink/20 px-4 hover:border-alert hover:bg-alert/10 hover:text-alert-ink"
          onClick={onCloseTable}
          disabled={!canClose || !canSend}
        >
          Close table
        </Button>
      </div>
    </footer>
  );
};

export default CheckFooter;
