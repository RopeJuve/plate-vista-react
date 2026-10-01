import type { QrTable } from "./tableList";
import { cn } from "@/lib/utils";

/** The grid of table numbers the admin picks a QR card from. */
const QrTablePicker = ({
  tables,
  selectedId,
  onSelect,
}: {
  tables: QrTable[];
  selectedId?: string;
  onSelect: (tableId: string) => void;
}) => (
  <div>
    <p id="table-picker" className="mb-2 text-sm font-semibold">
      Table
    </p>
    <ul aria-labelledby="table-picker" className="grid grid-cols-4 gap-2 lg:grid-cols-3">
      {tables.map((table) => (
        <li key={table._id}>
          <button
            type="button"
            onClick={() => onSelect(table._id)}
            aria-pressed={selectedId === table._id}
            aria-label={`Select table ${table.tableNumber}`}
            className={cn(
              "h-12 w-full rounded-md font-mono text-lg font-bold transition-colors",
              selectedId === table._id ? "bg-ink text-paper" : "bg-white ring-1 ring-ink/10 hover:ring-ink/30"
            )}
          >
            {table.tableNumber}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default QrTablePicker;
