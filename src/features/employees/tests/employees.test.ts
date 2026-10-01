import { describe, expect, it } from "vitest";
import { matchesEmployee, toEmployeeList, toEmployeeRow } from "../employees";

const maria = { _id: "e1", employee: "Maria", email: "maria@plate.de", position: "bar" };

describe("employees", () => {
  it("reads only a bare list as employees", () => {
    expect(toEmployeeList([maria])).toEqual([maria]);
    expect(toEmployeeList({ employees: [maria] })).toEqual([]);
    expect(toEmployeeList(null)).toEqual([]);
  });

  it("turns an employee into a table row keyed by their id", () => {
    expect(toEmployeeRow(maria)).toEqual({
      employeeId: "e1",
      employee: "Maria",
      email: "maria@plate.de",
      position: "bar",
    });
  });

  it("finds someone by name, email or position, ignoring case", () => {
    expect(matchesEmployee(maria, "MAR")).toBe(true);
    expect(matchesEmployee(maria, "plate.de")).toBe(true);
    expect(matchesEmployee(maria, "Bar")).toBe(true);
    expect(matchesEmployee(maria, "kitchen")).toBe(false);
    expect(matchesEmployee({}, "x")).toBe(false);
  });
});
