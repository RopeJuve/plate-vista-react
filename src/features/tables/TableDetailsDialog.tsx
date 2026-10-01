import type { Table } from "../../types";
import { openOrderCount } from "./tableList";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formatDateTime = (dateString?: string) => {
  if (!dateString) {
    return "—";
  }
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

/** Everything the server knows about one table, read-only. */
const TableDetailsDialog = ({
  table,
  open,
  onOpenChange,
}: {
  table: Table | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Table {table?.tableNumber}</DialogTitle>
      </DialogHeader>
      {table && (
        <dl className="divide-y divide-dashed divide-ink/15 text-sm">
          {[
            ["Table number", table.tableNumber],
            ["Capacity", table.capacity],
            ["Status", table.status],
            ["Open orders", openOrderCount(table)],
            ["Customers", table.customers ?? 0],
            ["Created", formatDateTime(table.createdAt)],
            ["Updated", formatDateTime(table.updatedAt)],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex items-baseline justify-between gap-4 py-2">
              <dt className="text-ink-soft">{label}</dt>
              <dd className="font-mono font-semibold tabular">{String(value ?? "—")}</dd>
            </div>
          ))}
        </dl>
      )}
    </DialogContent>
  </Dialog>
);

export default TableDetailsDialog;
