import { Minus, Plus } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import type { MenuRecord } from "../../features/guest-ordering/menu";
import { formatCents } from "../../shared/money/formatCents";
import { cn } from "@/lib/utils";
import MenuItemImage from "../../features/menu/MenuItemImage";

const MenuItemCard = ({ item }: { item: MenuRecord }) => {
  const { cart, addLine, setQuantity, removeLine } = useCart();
  const unavailable = !item.inStock || item.archived;
  const quantity = cart.find((line) => line.productId === item._id)?.quantity ?? 0;

  return (
    <article className="flex gap-4 border-b border-dashed border-ink/15 py-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className={cn("text-[1.05rem] font-bold leading-snug tracking-[-0.01em]", unavailable && "text-ink-soft")}>
          {item.title}
          {item.popular && !unavailable && (
            <span className="ml-2 inline-block translate-y-[-1px] rounded bg-signal/10 px-1.5 py-0.5 align-middle text-[0.65rem] font-bold uppercase tracking-[0.08em] text-signal-ink">
              Popular
            </span>
          )}
        </h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className={cn("font-mono text-base font-bold tabular", unavailable && "text-ink-soft line-through")}>
            {formatCents(item.priceCents)}
          </span>
          {unavailable ? (
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-alert-ink">Sold out</span>
          ) : quantity > 0 ? (
            <div className="flex items-center gap-1 rounded-full bg-ink p-1 text-paper" role="group" aria-label={`${item.title} in cart`}>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15"
                onClick={() => (quantity <= 1 ? removeLine(item._id) : setQuantity(item._id, quantity - 1))}
                aria-label={quantity <= 1 ? `Remove ${item.title} from cart` : `One less ${item.title}`}
              >
                <Minus className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <span className="w-6 text-center font-mono text-sm font-bold tabular" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full bg-signal text-ink hover:bg-signal-deep"
                onClick={() => addLine(item._id)}
                aria-label={`Add ${item.title} to cart`}
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white pl-3 pr-4 text-sm font-bold text-ink ring-1 ring-inset ring-ink/15 transition-colors hover:bg-ink hover:text-paper hover:ring-ink"
              onClick={() => addLine(item._id)}
              aria-label={`Add ${item.title} to cart`}
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              Add
            </button>
          )}
        </div>
      </div>
      <MenuItemImage
        image={item.image}
        station={item.station}
        dimmed={unavailable}
        className="h-24 w-24 shrink-0 rounded-lg sm:h-28 sm:w-28"
      />
    </article>
  );
};

export default MenuItemCard;
