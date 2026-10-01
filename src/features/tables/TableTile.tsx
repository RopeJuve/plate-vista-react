import { Users } from "lucide-react";
import type { Table } from "../../types";
import { tableStatusBadge, tableStatusOf } from "./tableStatus";
import { cn } from "@/lib/utils";

/** One table in the admin's list: its number, whether anyone is at it, and its seats. */
const TableTile = ({ table, onOpen }: { table: Table; onOpen: (table: Table) => void }) => {
  const status = tableStatusOf(table);
  return (
    <button
      type="button"
      className="flex h-36 w-full flex-col justify-between rounded-xl bg-white p-4 text-left ring-1 ring-ink/[0.07] transition-[box-shadow,transform] duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgb(0_0_0/0.25)]"
      onClick={() => onOpen(table)}
      aria-label={`Open details for table ${table.tableNumber}`}
    >
      <span className="flex items-start justify-between">
        <span className="text-[2.5rem] font-black leading-[0.85] tracking-[-0.04em]" style={{ fontVariationSettings: '"wdth" 80' }}>
          {table.tableNumber}
        </span>
        <span className={cn("rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em]", tableStatusBadge(status))}>
          {status}
        </span>
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
        <Users className="h-4 w-4" aria-hidden="true" />
        {table.capacity} seats
      </span>
    </button>
  );
};

export default TableTile;
