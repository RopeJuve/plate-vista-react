import type { ColumnDef } from "@tanstack/react-table";
import { formatCents } from "../../shared/money/formatCents";
import type { OrderRow } from "../../types";
import { OrderItemsCell, OrderStatusCell } from "./OrderCells";
import { shortOrderId } from "./orderRows";

/** Columns of the admin's order history. Defined once, outside render, so the table keeps its state. */
export const ORDER_COLUMNS: ColumnDef<OrderRow>[] = [
  { accessorKey: "user", header: "User" },
  {
    accessorKey: "menuItems",
    header: "Menu Items",
    cell: ({ row }) => <OrderItemsCell items={row.original.menuItems || []} />,
  },
  { accessorKey: "quantity", header: "Quantity" },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
    cell: ({ row }) => <span className="font-mono font-semibold">{formatCents(row.original.totalPrice)}</span>,
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
    cell: ({ row }) => <OrderStatusCell status={row.original.orderStatus} />,
  },
  { accessorKey: "location", header: "Location" },
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-ink-soft" title={row.original.orderId}>
        {shortOrderId(row.original.orderId)}
      </span>
    ),
  },
];
