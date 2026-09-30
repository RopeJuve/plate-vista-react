import { useState } from "react";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import type { MenuRecord } from "../../features/guest-ordering/menu";
import type { CartLine } from "../../features/guest-ordering/types";
import { formatCents, lineTotalCents } from "../../shared/money/formatCents";
import { LIMITS } from "../../shared/realtime/protocol";
import { QtyStepper } from "../rail";
import { cn } from "@/lib/utils";

/** One line of the cart: its quantity, its note for the kitchen, and what the server said about it. */
const CartLineRow = ({
  line,
  menuItem,
  unavailable,
  errors,
}: {
  line: CartLine;
  menuItem?: MenuRecord;
  unavailable: boolean;
  errors: string[];
}) => {
  const { setQuantity, setNotes, removeLine } = useCart();
  const [noteOpen, setNoteOpen] = useState(false);
  const title = menuItem?.title || "Unavailable item";
  const showNote = noteOpen || Boolean(line.notes);

  return (
    <li
      className={cn(
        "border-b border-dashed border-ink/15 py-3 last:border-0",
        unavailable && "-mx-2 rounded-md bg-alert/[0.07] px-2"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono font-bold leading-snug">{title}</p>
          {unavailable && <p className="text-sm font-semibold text-alert-ink">Unavailable</p>}
        </div>
        <p className="font-mono font-bold tabular">
          {formatCents(lineTotalCents(menuItem?.priceCents ?? 0, line.quantity))}
        </p>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <QtyStepper
          value={line.quantity}
          label={title}
          onDecrease={() => setQuantity(line.productId, line.quantity - 1)}
          onIncrease={() => setQuantity(line.productId, line.quantity + 1)}
        />
        {!showNote && (
          <button
            type="button"
            className="ml-2 inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-ink-soft hover:bg-ink/[0.06] hover:text-ink"
            onClick={() => setNoteOpen(true)}
          >
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            Note
          </button>
        )}
        <button
          type="button"
          className="ml-auto grid h-10 w-10 place-items-center rounded-md text-ink-soft hover:bg-alert/10 hover:text-alert-ink"
          onClick={() => removeLine(line.productId)}
          aria-label={`Remove ${title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {showNote && (
        <div className="mt-2">
          <label className="flex justify-between text-xs font-semibold text-ink-soft" htmlFor={`notes-${line.productId}`}>
            <span>Note for the kitchen</span>
            <span className="font-mono tabular">
              {line.notes.length}/{LIMITS.MAX_NOTES_LENGTH}
            </span>
          </label>
          <textarea
            id={`notes-${line.productId}`}
            value={line.notes}
            maxLength={LIMITS.MAX_NOTES_LENGTH}
            onChange={(event) => setNotes(line.productId, event.target.value)}
            placeholder="No onions, extra ice…"
            rows={2}
            className="mt-1 w-full resize-none rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-signal focus:ring-[3px] focus:ring-signal/20"
            aria-label={`Notes for ${title}`}
          />
        </div>
      )}
      {errors.map((error) => (
        <p key={error} className="text-sm text-alert-ink">
          {error}
        </p>
      ))}
    </li>
  );
};

export default CartLineRow;
