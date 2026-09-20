import { useEffect, useState } from "react";
import { Utensils } from "lucide-react";
import { fetchTables } from "../services/tableDataFetch";
import { Header } from "../Components/AdminComponents";
import { tableColors } from "../data/data";
import { notify } from "../utils/notify";
import { useWebSocketContext } from "../contexts/WebSocketContext";
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
  const { tables: liveTables } = useWebSocketContext();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTables()
      .then((response) => setTables(response.data || []))
      .catch((error) => {
        notify(error.response?.data?.message || "Could not load tables");
      });
  }, []);

  useEffect(() => {
    if (liveTables?.length) {
      setTables(liveTables);
    }
  }, [liveTables]);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 dark:bg-d-main-bg rounded-3xl shadow-lg transition-colors duration-300 ease-in-out ">
      <Header title="Tables" />
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
