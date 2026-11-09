import { useOrder } from "../../contexts/OrderContext";
import { countItems, linesTotalCents } from "../../features/guest-ordering/cartLines";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import type { PlaceOrder } from "../../features/guest-ordering/hooks/usePlaceOrder";
import { PLACE_ORDER_LABEL } from "../../features/guest-ordering/placeOrderStatus";
import { formatCents } from "../../shared/money/formatCents";
import { TotalLine } from "../rail";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type CheckFooterProps = {
  totalCents: number;
  canSend: boolean;
  canClose: boolean;
  /** Why the table cannot close yet ("Record the payment first"), shown as the button's tooltip. */
  closeBlock: string | null;
  /** An owner or admin may close an unpaid bill anyway. */
  canCloseUnpaid: boolean;
  /** What the last close attempt ran into, e.g. "This bill isn't paid yet". */
  closeNotice: string | null;
  placeOrder: PlaceOrder;
  onCloseTable: () => void;
  onCloseUnpaid: () => void;
};

/** The foot of a table's check: what the unsent lines add, the running total, and the ways out. */
const CheckFooter = ({
  totalCents,
  canSend,
  canClose,
  closeBlock,
  canCloseUnpaid,
  closeNotice,
  placeOrder,
  onCloseTable,
  onCloseUnpaid,
}: CheckFooterProps) => {
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
      {closeNotice && (
        <p className="text-sm font-semibold text-alert-ink" role="alert">
          {closeNotice}
        </p>
      )}
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
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            {/* A disabled button gets no pointer events, so the wrapper carries the tooltip. */}
            <TooltipTrigger asChild>
              <span data-testid="close-table-hint" tabIndex={closeBlock ? 0 : -1} className="grid">
                <Button
                  type="button"
                  size="xl"
                  variant="outline"
                  className="border-ink/20 px-4 hover:border-alert hover:bg-alert/10 hover:text-alert-ink"
                  onClick={onCloseTable}
                  disabled={!canClose || !canSend || Boolean(closeBlock)}
                >
                  Close table
                </Button>
              </span>
            </TooltipTrigger>
            {closeBlock && <TooltipContent>{closeBlock}</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
      {canClose && canCloseUnpaid && closeBlock && (
        <Button type="button" variant="ghost" className="w-full text-alert-ink" onClick={onCloseUnpaid} disabled={!canSend}>
          Close without payment
        </Button>
      )}
    </footer>
  );
};

export default CheckFooter;
