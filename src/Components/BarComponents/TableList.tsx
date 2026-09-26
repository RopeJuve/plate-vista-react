import Table from "./Table";
import { useStaffBoard } from "../../features/staff-board/StaffBoardProvider";

const TableList = () => {
  const { state } = useStaffBoard();
  const tables = Object.values(state.tablesById).sort((a, b) => a.tableNumber - b.tableNumber);

  return (
    <div className="grid auto-rows-max grid-flow-row grid-cols-table gap-20 border-t-1 border-t-gray-500 p-10 md:h-screen">
      {tables.map((table) => (
        <Table key={table._id} tableId={table._id} tableNumber={table.tableNumber} status={table.status} />
      ))}
      {!state.ready && <p className="text-gray-300">Connecting…</p>}
      {state.ready && tables.length === 0 && <p className="text-gray-300">No tables yet</p>}
    </div>
  );
};

export default TableList;
