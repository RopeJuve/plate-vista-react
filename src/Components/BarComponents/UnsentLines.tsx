import { X } from "lucide-react";
import { useOrder } from "../../contexts/OrderContext";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { QtyStepper } from "../rail";

/** What staff have tapped in for this table and not sent to the kitchen yet. */
const UnsentLines = () => {
  const { pad, setQuantity, removeLine } = useOrder();
  const { itemsById } = useMenu();

  if (pad.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-signal-ink">Not sent yet</h3>
      <ul className="space-y-2">
        {pad.map((line) => {
          const title = itemsById[line.productId]?.title || "Item";
          return (
            <li key={line.productId} className="flex items-center gap-2">
              <QtyStepper
                value={line.quantity}
                label={title}
                onDecrease={() => setQuantity(line.productId, line.quantity - 1)}
                onIncrease={() => setQuantity(line.productId, line.quantity + 1)}
              />
              <span className="min-w-0 flex-1 truncate font-mono text-[0.92rem]">{title}</span>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-md text-ink-soft hover:bg-alert/10 hover:text-alert-ink"
                onClick={() => removeLine(line.productId)}
                aria-label={`Remove ${title}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UnsentLines;
