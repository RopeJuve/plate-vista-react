import { describe, expect, it } from "vitest";
import { ORDER_STATUSES } from "../../../shared/realtime/protocol";
import type { BoardState } from "../boardState";
import { BOARD_LANES, openOrderCount } from "../boardLanes";
import { isOverdue, OVERDUE_AFTER_MINUTES } from "../ticketTiming";

describe("board lanes", () => {
  it("gives every status but cancelled exactly one lane", () => {
    const laned = BOARD_LANES.flatMap((lane) => lane.statuses);
    expect(new Set(laned).size).toBe(laned.length);
    expect([...laned].sort()).toEqual(ORDER_STATUSES.filter((status) => status !== "cancelled").sort());
  });

  it("counts orders still in the house", () => {
    const ordersById = Object.fromEntries(
      ORDER_STATUSES.map((status) => [status, { status }])
    ) as unknown as BoardState["ordersById"];
    expect(openOrderCount({ ordersById })).toBe(ORDER_STATUSES.length - 2);
  });
});

describe("ticket timing", () => {
  it("flags a ticket once it has waited its status's limit", () => {
    expect(isOverdue(4.9, OVERDUE_AFTER_MINUTES.pending)).toBe(false);
    expect(isOverdue(5, OVERDUE_AFTER_MINUTES.pending)).toBe(true);
  });

  it("never flags a status without a limit", () => {
    expect(isOverdue(600, OVERDUE_AFTER_MINUTES.served)).toBe(false);
  });
});
