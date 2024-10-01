import { useState, useEffect } from "react";
import Table from "./Table";
import { fetchTables } from "../../services/tableDataFetch";

const TableList = () => {
  const [tables, setTables] = useState([]);
  useEffect(() => {
    const tablesData = async () => {
      try {
        const { data } = await fetchTables();
        setTables(data);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };
    tablesData();
  }, []);
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
