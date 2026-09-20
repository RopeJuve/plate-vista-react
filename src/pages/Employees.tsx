import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Header } from "../Components/AdminComponents";
import { fetchEmployees } from "../services/employeeDataFetch";
import { useStateContext } from "../contexts/ContextProvider";
import { notify } from "../utils/notify";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import type { EmployeeRow } from "@/types";

const Employees = () => {
  const { currentColor } = useStateContext();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees()
      .then((response) => {
        const transformedEmployees = response.data.map((employee) => ({
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
      { accessorKey: "employeeId", header: "Employee ID" },
      { accessorKey: "employee", header: "Employee" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "position", header: "Position" },
    ],
    []
  );

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-d-main-bg rounded-3xl">
      <Header title="Employees" />
      <div className="mt-2 mb-2 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/admin/register")}
          style={{ borderColor: currentColor, color: currentColor }}
        >
          Add New Employee
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={employees}
        searchPlaceholder="Search employees"
      />
    </div>
  );
};

export default Employees;
