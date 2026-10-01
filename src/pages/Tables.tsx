import { useState } from "react";
import { Header } from "../Components/AdminComponents";
import AddTableForm from "../features/tables/AddTableForm";
import TableDetailsDialog from "../features/tables/TableDetailsDialog";
import TableTile from "../features/tables/TableTile";
import { useTables } from "../features/tables/hooks/useTables";
import { byTableNumber } from "../features/tables/tableList";
import type { Table } from "@/types";

/** The admin's floor: add tables and look one up. */
const Tables = () => {
  const { tables, saving, addTable } = useTables();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  return (
    <div>
      <Header title="Tables" description="Each table gets its own QR code. Guests scan it to open their check." />
      <AddTableForm saving={saving} onAdd={addTable} />

      {tables.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-ink/15 px-6 py-16 text-center">
          <p className="text-lg font-bold">No tables yet</p>
          <p className="mt-1 text-sm text-ink-soft">Add your first table above. It shows up on the staff floor plan straight away.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3">
          {byTableNumber(tables).map((table) => (
            <li key={table._id || table.tableNumber}>
              <TableTile table={table} onOpen={handleOpen} />
            </li>
          ))}
        </ul>
      )}

      <TableDetailsDialog table={selectedTable} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
};

export default Tables;
