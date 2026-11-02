import type { OrderRow } from "../../types";
import { orderStatusBadge } from "./orderStatusBadge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** What was on an order: the one dish by name, or a dropdown when there are several. */
export const OrderItemsCell = ({ items }: { items: OrderRow["menuItems"] }) => {
  if (items.length === 0) {
    return <span>Unavailable item</span>;
  }
  if (items.length === 1) {
    return <span>{items[0].title}</span>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          See products
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((item, index) => (
          <DropdownMenuItem key={`${item.title}-${index}`}>
            {item.title} ({item.quantity})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/** Where an order stands, coloured the way the staff board colours it. */
export const OrderStatusCell = ({ status }: { status?: string }) => {
  const { className, label } = orderStatusBadge(status);
  return (
    <span
      className={cn("inline-flex h-6 items-center rounded px-2 text-[0.7rem] font-bold uppercase tracking-[0.08em]", className)}
    >
      {label}
    </span>
  );
};
