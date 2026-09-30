import { useOrder } from "../../contexts/OrderContext";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { formatCents } from "../../shared/money/formatCents";
import { cn } from "@/lib/utils";

const BarMenuItems = ({ category }: { category: string }) => {
  const { items, loading } = useMenu();
  const { pad } = useOrder();
  const visible = items.filter((item) => item.category === category && !item.archived);
  const inPad = Object.fromEntries(pad.map((line) => [line.productId, line.quantity]));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-44 sm:px-5 lg:px-0 lg:pb-2">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2.5">
        {visible.map((menuItem) => (
          <BarMenuItemButton
            key={menuItem._id}
            productId={menuItem._id}
            title={menuItem.title}
            priceCents={menuItem.priceCents}
            inStock={menuItem.inStock}
            quantity={inPad[menuItem._id] ?? 0}
          />
        ))}
        {loading &&
          visible.length === 0 &&
          Array.from({ length: 8 }, (_, index) => (
            <span key={index} className="h-[6.5rem] animate-pulse rounded-lg bg-steel-800" aria-hidden="true" />
          ))}
      </div>
      {!loading && category && visible.length === 0 && (
        <p className="mt-10 text-center text-sm text-steel-300">Nothing in this category yet.</p>
      )}
    </div>
  );
};

const BarMenuItemButton = ({
  productId,
  title,
  priceCents,
  inStock,
  quantity,
}: {
  productId: string;
  title: string;
  priceCents: number;
  inStock: boolean;
  quantity: number;
}) => {
  const { addLine } = useOrder();
  return (
    <button
      type="button"
      className={cn(
        "relative flex h-[6.5rem] flex-col justify-between rounded-lg p-3 text-left transition-[background-color,transform] duration-100 active:scale-[0.97]",
        quantity > 0 ? "bg-paper text-ink" : "bg-steel-800 text-paper hover:bg-steel-700",
        !inStock && "cursor-not-allowed bg-steel-850 text-steel-300 hover:bg-steel-850"
      )}
      onClick={() => addLine(productId)}
      disabled={!inStock}
      aria-label={`${title} · ${formatCents(priceCents)}`}
    >
      <span className={cn("line-clamp-2 pr-7 text-[0.95rem] font-bold leading-tight", !inStock && "line-through")}>
        {title}
      </span>
      <span className="flex items-end justify-between">
        <span className="font-mono text-sm tabular opacity-80">{formatCents(priceCents)}</span>
        {!inStock && <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em]">Out</span>}
      </span>
      {quantity > 0 && (
        <span
          className="absolute right-2 top-2 grid h-7 min-w-[1.75rem] place-items-center rounded-full bg-signal px-1.5 font-mono text-sm font-bold text-ink tabular"
          aria-hidden="true"
        >
          {quantity}
        </span>
      )}
    </button>
  );
};

export default BarMenuItems;
