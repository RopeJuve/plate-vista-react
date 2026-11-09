import { describe, expect, it } from "vitest";
import { staffBoard, TABLE_ID } from "../../../mocks/fixtures/staffBoard";
import { openSessionIdFor } from "../openSession";

describe("openSessionIdFor", () => {
  it("finds the open session at a table", () => {
    expect(openSessionIdFor(staffBoard, TABLE_ID)).toBe("session-1");
  });

  it("still finds a session that is being paid", () => {
    const paying = { sessions: [{ ...staffBoard.sessions[0], status: "paying" as const }] };
    expect(openSessionIdFor(paying, TABLE_ID)).toBe("session-1");
  });

  it("is null for a free table, a closed session or an unreadable board", () => {
    expect(openSessionIdFor(staffBoard, "table-5")).toBeNull();
    const closed = { sessions: [{ ...staffBoard.sessions[0], status: "closed" as const }] };
    expect(openSessionIdFor(closed, TABLE_ID)).toBeNull();
    expect(openSessionIdFor(null, TABLE_ID)).toBeNull();
  });
});
