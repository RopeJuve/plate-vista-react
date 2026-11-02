import type { Employee, EmployeeRow } from "../../types";

/** `GET /employee` answers with a bare list; anything else means nobody to show. */
export const toEmployeeList = (data: unknown): Employee[] => (Array.isArray(data) ? (data as Employee[]) : []);

export const toEmployeeRow = (employee: Employee): EmployeeRow => ({
  employeeId: employee._id,
  employee: employee.employee,
  email: employee.email,
  position: employee.position,
});

/** A search hits an employee's name, email or position, ignoring case. */
export const matchesEmployee = (employee: Employee, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  return [employee.employee, employee.email, employee.position].some((field) =>
    (field || "").toLowerCase().includes(needle)
  );
};
