import { useEffect, useState } from "react";
import type { Employee } from "../../../types";
import { apiMessage, notify } from "../../../utils/notify";
import { fetchEmployeeList } from "../employeesApi";

/** Everyone who can sign in, loaded once when the screen opens. */
export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchEmployeeList()
      .then((list) => {
        if (!cancelled) {
          setEmployees(list);
        }
      })
      .catch((error) => notify(apiMessage(error, "Could not load employees")));
    return () => {
      cancelled = true;
    };
  }, []);

  return { employees };
};
