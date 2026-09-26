import { useEffect, useState } from "react";
import { Utensils } from "lucide-react";
import { fetchTables } from "../services/tableDataFetch";
import api from "../services/api";
import { Header } from "../Components/AdminComponents";
import { tableColors } from "../data/data";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Table } from "@/types";

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

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 dark:bg-d-main-bg rounded-3xl shadow-lg transition-colors duration-300 ease-in-out ">
      <Header title="Tables" />
      <form
        className="mb-6 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void handleAddTable();
        }}
      >
        <div className="grid gap-1">
          <Label htmlFor="table-number">Table number</Label>
          <Input
            id="table-number"
            type="number"
            min={1}
            value={tableNumber}
            onChange={(event) => setTableNumber(event.target.value)}
            className="w-32"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="table-capacity">Capacity</Label>
          <Input
            id="table-capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            className="w-32"
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Adding…" : "Add table"}
        </Button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table, index) => (
          <button
            type="button"
            key={table._id || table.tableNumber}
            className="overflow-hidden rounded-lg text-left"
            onClick={() => handleTableClick(table)}
            aria-label={`Open details for table ${table.tableNumber}`}
          >
            <Card
              className="flex items-center bg-white p-4"
              style={{ backgroundColor: tableColors[index % tableColors.length] }}
            >
              <Utensils className="mr-4 h-10 w-10 shrink-0 text-gray-700" />
              <div>
                <CardHeader className="p-0">
                  <CardTitle className="text-base font-bold">
                    Table {table.tableNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-gray-600">
                  <p>Capacity: {table.capacity}</p>
                  <p>Status: {table.status}</p>
                </CardContent>
              </div>
            </Card>
          </button>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[400px] max-w-[500px] overflow-hidden rounded-[10px]">
          <DialogHeader>
            <DialogTitle>Table {selectedTable?.tableNumber} Details</DialogTitle>
          </DialogHeader>
          {selectedTable && (
            <div className="space-y-1">
              <p><strong>Table Number:</strong> {selectedTable.tableNumber}</p>
              <p><strong>Capacity:</strong> {selectedTable.capacity}</p>
              <p><strong>Status:</strong> {selectedTable.status}</p>
              <p><strong>Open orders:</strong> {orderCount(selectedTable)}</p>
              <p><strong>Customers:</strong> {selectedTable.customers ?? 0}</p>
              <p><strong>Created:</strong> {formatDateTime(selectedTable.createdAt)}</p>
              <p><strong>Updated at:</strong> {formatDateTime(selectedTable.updatedAt)}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tables;
