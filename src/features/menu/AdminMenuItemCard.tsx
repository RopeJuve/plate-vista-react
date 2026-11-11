import { Pencil, Trash2 } from "lucide-react";
import type { VatRate } from "../../shared/api/payments";
import { formatCents } from "../../shared/money/formatCents";
import type { MenuItem } from "../../types";
import MenuItemImage from "./MenuItemImage";
import VatBadge from "./VatBadge";
import { Button } from "@/components/ui/button";

/** One dish on the admin's menu: photo, price, VAT rate, flags, and the edit and delete buttons. */
const AdminMenuItemCard = ({
  item,
  vatRate,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  /** Its category's rate; unknown until the categories have loaded. */
  vatRate?: VatRate;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}) => {
  const soldOut = item.inStock === false;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-ink/[0.07]">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
        <MenuItemImage image={item.image} station={item.station} dimmed={soldOut} className="absolute inset-0 h-full w-full" />
        <div className="absolute left-2 top-2 flex gap-1.5">
          {item.popular && (
            <span className="rounded bg-signal px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink">
              Popular
            </span>
          )}
          {soldOut && (
            <span className="rounded bg-ink px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-paper">
              Sold out
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold leading-snug">{item.title}</h3>
          <span className="font-mono font-bold tabular">{formatCents(item.priceCents)}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{item.category}</p>
          {vatRate && <VatBadge rate={vatRate} />}
        </div>
        {item.description && <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{item.description}</p>}
        <div className="mt-auto flex gap-2 pt-4">
          <Button type="button" variant="outline" size="sm" className="flex-1 border-ink/15" onClick={() => onEdit(item)}>
            <Pencil aria-hidden="true" />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-ink-soft hover:bg-alert/10 hover:text-alert-ink"
            onClick={() => onDelete(item)}
            aria-label={`Delete ${item.title}`}
          >
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
};

export default AdminMenuItemCard;
