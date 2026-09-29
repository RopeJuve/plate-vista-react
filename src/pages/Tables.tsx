import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { fetchTables } from "../services/tableDataFetch";
import api from "../services/api";
import { Header } from "../Components/AdminComponents";
import { apiMessage, notify } from "../utils/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Table } from "@/types";
import { cn } from "@/lib/utils";

const formatDateTime = (dateString?: string) => {
  if (!dateString) {
    return "—";
  }
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const orderCount = (table: Table) => {
  if (!table?.orders) {
    return 0;
  }
  return Array.isArray(table.orders) ? table.orders.length : 0;
};

const STATUS_STYLE: Record<string, string> = {
  occupied: "bg-ink text-paper",
  reserved: "bg-amber text-ink",
  vacant: "bg-ink/[0.06] text-ink-soft",
};

const Tables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("1");
  const [capacity, setCapacity] = useState("4");
  const [saving, setSaving] = useState(false);

  const loadTables = () =>
    fetchTables()
      .then((response) => {
        const data = response.data;
        setTables(Array.isArray(data) ? data : data?.tables || []);
      })
      .catch((error: unknown) => {
        notify(apiMessage(error, "Could not load tables"));
      });

  useEffect(() => {
    void loadTables();
    // The admin has no socket, so pick up tables staff seat or close meanwhile.
    const refresh = () => {
      if (document.visibilityState === "visible") {
        void loadTables();
      }
    };
    const timer = setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const handleAddTable = async () => {
    const number = Number(tableNumber);
    const seats = Number(capacity);
    if (!Number.isInteger(number) || number < 1 || !Number.isInteger(seats) || seats < 1) {
      notify("Enter a table number and capacity");
      return;
    }
    setSaving(true);
    try {
      await api.post("/table", { tableNumber: number, capacity: seats });
      notify("Table added", "success");
      await loadTables();
    } catch (error: unknown) {
      notify(apiMessage(error, "Could not add the table"));
    } finally {
      setSaving(false);
    }
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const sorted = [...tables].sort((a, b) => Number(a.tableNumber) - Number(b.tableNumber));

  return (
    <div>
      <Header title="Tables" description="Each table gets its own QR code. Guests scan it to open their check." />

      <form
        className="mb-8 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 ring-1 ring-ink/[0.07]"
        onSubmit={(event) => {
          event.preventDefault();
          void handleAddTable();
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="table-number">Table number</Label>
          <Input
            id="table-number"
            type="number"
            min={1}
            value={tableNumber}
            onChange={(event) => setTableNumber(event.target.value)}
            className="w-32 font-mono"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="table-capacity">Capacity</Label>
          <Input
            id="table-capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            className="w-32 font-mono"
          />
        </div>
        <Button type="submit" size="lg" className="h-11" disabled={saving}>
          <Plus aria-hidden="true" />
          {saving ? "Adding…" : "Add table"}
        </Button>
      </form>

      {tables.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-ink/15 px-6 py-16 text-center">
          <p className="text-lg font-bold">No tables yet</p>
          <p className="mt-1 text-sm text-ink-soft">Add your first table above. It shows up on the staff floor plan straight away.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3">
          {sorted.map((table) => {
            const status = table.status || "vacant";
            return (
              <li key={table._id || table.tableNumber}>
                <button
                  type="button"
                  className="flex h-36 w-full flex-col justify-between rounded-xl bg-white p-4 text-left ring-1 ring-ink/[0.07] transition-[box-shadow,transform] duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgb(0_0_0/0.25)]"
                  onClick={() => handleTableClick(table)}
                  aria-label={`Open details for table ${table.tableNumber}`}
                >
                  <span className="flex items-start justify-between">
                    <span className="text-[2.5rem] font-black leading-[0.85] tracking-[-0.04em]" style={{ fontVariationSettings: '"wdth" 80' }}>
                      {table.tableNumber}
                    </span>
                    <span className={cn("rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em]", STATUS_STYLE[status] ?? STATUS_STYLE.vacant)}>
                      {status}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    {table.capacity} seats
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Table {selectedTable?.tableNumber}</DialogTitle>
          </DialogHeader>
          {selectedTable && (
            <dl className="divide-y divide-dashed divide-ink/15 text-sm">
              {[
                ["Table number", selectedTable.tableNumber],
                ["Capacity", selectedTable.capacity],
                ["Status", selectedTable.status],
                ["Open orders", orderCount(selectedTable)],
                ["Customers", selectedTable.customers ?? 0],
                ["Created", formatDateTime(selectedTable.createdAt)],
                ["Updated", formatDateTime(selectedTable.updatedAt)],
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
    </div>
  );
};

export default Tables;
