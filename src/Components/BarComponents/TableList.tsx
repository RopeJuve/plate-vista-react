import { useMemo } from "react";
import Table, { type TableSummary } from "./Table";
import RecentlyClosed from "./RecentlyClosed";
import { useStaffBoard } from "../../features/staff-board/StaffBoardProvider";
import { sumCents } from "../../shared/money/formatCents";
import { ticketsOf } from "../../shared/realtime/tickets";

const TableList = () => {
  const { state } = useStaffBoard();
  const tables = Object.values(state.tablesById).sort((a, b) => a.tableNumber - b.tableNumber);

  // One pass over the orders gives every tile its bill, its open and ready
  // tickets, and its oldest open ticket.
  const summaries = useMemo(() => {
    const byTable: Record<string, TableSummary> = {};
    Object.values(state.ordersById).forEach((order) => {
      if (order.status === "cancelled") {
        return;
      }
      const summary = (byTable[order.tableId] ??= { open: 0, ready: 0, totalCents: 0, oldestOpenAt: "" });
      summary.totalCents = sumCents([summary.totalCents, order.totalCents]);
      ticketsOf(order).forEach((ticket) => {
        if (ticket.status === "cancelled") {
          return;
        }
        if (ticket.status === "ready") {
          summary.ready += 1;
        }
        if (ticket.status !== "served") {
          summary.open += 1;
          if (!summary.oldestOpenAt || order.createdAt < summary.oldestOpenAt) {
            summary.oldestOpenAt = order.createdAt;
          }
        }
      });
    });
    return byTable;
  }, [state.ordersById]);

  const occupied = tables.filter((table) => table.status === "occupied").length;

  return (
    <section aria-labelledby="floor-title" className="mx-auto w-full max-w-[1920px] px-3 pb-10 pt-5 sm:px-5">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h1 id="floor-title" className="text-2xl font-extrabold tracking-[-0.02em] text-paper">
          Floor
        </h1>
        {state.ready && tables.length > 0 && (
          <p className="font-mono text-sm text-steel-300">
            <span className="text-paper">{occupied}</span> seated · {tables.length - occupied} free
          </p>
        )}
      </div>
      {!state.ready && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-xl bg-steel-800" />
          ))}
        </div>
      )}
      {!state.ready && <p className="sr-only">Connecting…</p>}
      {state.ready && tables.length === 0 && (
        <div className="grid place-items-center rounded-xl border border-dashed border-steel-700 px-6 py-16 text-center">
          <p className="text-lg font-bold text-paper">No tables yet</p>
          <p className="mt-1 max-w-sm text-sm text-steel-300">
            An admin adds tables under Admin, then Tables. They show up here straight away.
          </p>
        </div>
      )}
      {state.ready && tables.length > 0 && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
          {tables.map((table) => (
            <li key={table._id}>
              <Table
                tableId={table._id}
                tableNumber={table.tableNumber}
                status={table.status}
                capacity={table.capacity}
                joinCode={state.sessionsById[state.sessionIdByTable[table._id]]?.joinCode}
                summary={summaries[table._id]}
              />
            </li>
          ))}
        </ul>
      )}
      {state.ready && <RecentlyClosed entries={state.recentlyClosed} />}
    </section>
  );
};

export default TableList;
