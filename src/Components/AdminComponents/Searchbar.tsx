import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Search, X } from "lucide-react";
import { fetchEmployees } from "../../services/employeeDataFetch";
import { useStateContext } from "../../contexts/ContextProvider";
import { Employee } from "../../types";

const Searchbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const { setIsClicked, initialState } = useStateContext();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const requirement = event.target.value;
    setSearchTerm(requirement);

    fetchEmployees().then((response) => {
      const employees = (Array.isArray(response.data) ? response.data : []) as Employee[];

      const filteredResults = employees.filter((employee) =>
        (employee.employee || "").toLowerCase().includes(requirement.toLowerCase()) ||
        (employee.email || "").toLowerCase().includes(requirement.toLowerCase()) ||
        (employee.position || "").toLowerCase().includes(requirement.toLowerCase())
      );

      setFilteredEmployees(filteredResults);
    });
  };

  const handleCancel = () => {
    setIsClicked(initialState);
    setSearchTerm("");
    setFilteredEmployees([]);
  };

  return (
    <div
      className="absolute right-4 top-[calc(100%+0.5rem)] w-[min(24rem,calc(100vw-2rem))] rounded-xl bg-white p-4 text-ink shadow-[0_20px_50px_-12px_rgb(0_0_0/0.3)] ring-1 ring-ink/10 animate-in fade-in-0 slide-in-from-top-2 sm:right-6 lg:right-10"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          handleCancel();
        }
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="font-bold">Employee search</p>
        <button
          type="button"
          onClick={handleCancel}
          className="grid h-9 w-9 place-items-center rounded-md text-ink/60 hover:bg-ink/[0.06] hover:text-ink"
          aria-label="Close search"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          className="h-11 w-full rounded-md border border-ink/15 bg-paper pl-9 pr-3 outline-none focus:border-signal focus:ring-[3px] focus:ring-signal/20"
          placeholder="Name, email or position"
          aria-label="Search by name, email, or position"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="mt-2 max-h-64 overflow-auto">
        {filteredEmployees.length > 0 ? (
          <ul className="divide-y divide-dashed divide-ink/10">
            {filteredEmployees.map((employee) => (
              <li key={employee._id} className="flex items-center gap-3 py-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-xs font-black uppercase text-paper" aria-hidden="true">
                  {(employee.employee || "?").charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{employee.employee}</span>
                  <span className="block truncate text-xs text-ink-soft">{employee.email}</span>
                </span>
                <span className="rounded bg-ink/[0.06] px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.08em]">
                  {employee.position}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          searchTerm && <p className="py-4 text-center text-sm text-ink-soft">No one matches that.</p>
        )}
      </div>
    </div>
  );
};

export default Searchbar;
