import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { UserPlus } from "lucide-react";
import { Header } from "../Components/AdminComponents";
import { toEmployeeRow } from "../features/employees/employees";
import { useEmployees } from "../features/employees/hooks/useEmployees";
import { initialOf } from "../shared/auth/staffName";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import type { EmployeeRow } from "@/types";

/** Everyone on staff, with the way to add someone new. */
const Employees = () => {
  const { employees } = useEmployees();
  const rows = useMemo(() => employees.map(toEmployeeRow), [employees]);
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<EmployeeRow>[]>(
    () => [
      {
        accessorKey: "employee",
        header: "Employee",
        cell: ({ row }) => (
          <span className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-black uppercase text-paper" aria-hidden="true">
              {initialOf(row.original.employee)}
            </span>
            <span className="font-semibold">{row.original.employee}</span>
          </span>
        ),
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => (
          <span className="rounded bg-ink/[0.06] px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em]">
            {row.original.position}
          </span>
        ),
      },
      {
        accessorKey: "employeeId",
        header: "Employee ID",
        cell: ({ row }) => <span className="font-mono text-xs text-ink-soft">{row.original.employeeId}</span>,
      },
    ],
    []
  );

  return (
    <div>
      <Header
        title="Employees"
        description="Everyone who can sign in to the board or the admin."
        actions={
          <Button type="button" variant="ink" onClick={() => navigate("/admin/register")}>
            <UserPlus aria-hidden="true" />
            Add New Employee
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search employees"
      />
    </div>
  );
};

export default Employees;
