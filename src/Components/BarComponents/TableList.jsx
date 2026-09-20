import { useEffect, useState } from "react";
import Table from "./Table";
import { fetchTables } from "../../services/tableDataFetch";
import { notify } from "../../utils/notify";
import { useWebSocketContext } from "../../contexts/WebSocketContext";

const TableList = () => {
  const { tables: liveTables } = useWebSocketContext();
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const tablesData = async () => {
      try {
        const { data } = await fetchTables();
        setTables(data || []);
      } catch (error) {
        notify(error.response?.data?.message || "Could not load tables");
      }
    };
    tablesData();
  }, []);

  useEffect(() => {
    if (liveTables?.length) {
      setTables(liveTables);
    }
  }, [liveTables]);

  return (
    <div className="p-10 grid gap-20 grid-flow-row auto-rows-max grid-cols-table border-t-1 border-t-gray-500 md:h-screen">
      {tables.map((table) => (
        <Table
          key={table._id}
          tableNum={table.tableNumber}
          status={table.status}
        />
      ))}
    </div>
  );
};

export default TableList;
