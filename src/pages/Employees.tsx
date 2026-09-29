import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { UserPlus } from "lucide-react";
import { Header } from "../Components/AdminComponents";
import { fetchEmployees } from "../services/employeeDataFetch";
import { notify } from "../utils/notify";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import type { Employee, EmployeeRow } from "@/types";

const Employees = () => {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees()
      .then((response) => {
        const transformedEmployees = (Array.isArray(response.data) ? response.data : []).map(
          (employee: Employee) => ({
          employeeId: employee._id,
          employee: employee.employee,
          email: employee.email,
          position: employee.position,
        }));
        setEmployees(transformedEmployees);
      })
      .catch((error) => {
        notify(error.response?.data?.message || "Could not load employees");
      });
  }, []);

  const columns = useMemo<ColumnDef<EmployeeRow>[]>(
    () => [
      {
        accessorKey: "employee",
        header: "Employee",
        cell: ({ row }) => (
          <span className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-black uppercase text-paper" aria-hidden="true">
              {(row.original.employee || "?").charAt(0)}
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
        data={employees}
        searchPlaceholder="Search employees"
      />
    </div>
  );
};

export default Employees;
