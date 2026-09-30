import { describe, expect, it } from "vitest";
import { fillDates, rangeQuery } from "../statsRange";

const now = new Date(2026, 8, 29, 15, 30); // 29 Sep 2026, local time

describe("stats ranges", () => {
  it("covers the last 7 days including today, from local midnight", () => {
    const query = rangeQuery("7d", now);
    expect(query.groupBy).toBe("day");
    expect(query.start).toEqual(new Date(2026, 8, 23));
    expect(query.params.end_date).toBe(now.toISOString());
  });

  it("sends no dates for all time and groups it by month", () => {
    expect(rangeQuery("all", now)).toEqual({ params: {}, groupBy: "month", start: null });
  });

  it("fills quiet days with zeros so the chart does not skip them", () => {
    const filled = fillDates(
      [
        { date: "2026-09-24", ordersCount: 2, totalCents: 1500 },
        { date: "2026-09-29", ordersCount: 1, totalCents: 400 },
      ],
      "7d",
      now
    );
    expect(filled.map((row) => row.date)).toEqual([
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
      "2026-09-28",
      "2026-09-29",
    ]);
    expect(filled[1].totalCents).toBe(1500);
    expect(filled[2]).toEqual({ date: "2026-09-25", ordersCount: 0, totalCents: 0 });
  });

  it("runs all time from the first month with orders to this month", () => {
    const filled = fillDates([{ date: "2026-07", ordersCount: 3, totalCents: 900 }], "all", now);
    expect(filled.map((row) => row.date)).toEqual(["2026-07", "2026-08", "2026-09"]);
  });

  it("has nothing to chart when all time has no orders", () => {
    expect(fillDates([], "all", now)).toEqual([]);
  });
});

describe("category chart rows", () => {
  it("turns category rows into one row per day with a key per category", async () => {
    const { pivotCategories } = await import("../statsRange");
    const chart = pivotCategories(
      [
        { date: "2026-09-28", category: "food", numSold: 2, totalCents: 2000 },
        { date: "2026-09-28", category: "drinks", numSold: 3, totalCents: 1200 },
        { date: "2026-09-29", category: "drinks", numSold: 1, totalCents: 400 },
      ],
      "7d",
      now
    );
    expect(chart.categories).toEqual([
      { key: "c0", label: "drinks" },
      { key: "c1", label: "food" },
    ]);
    expect(chart.rows).toHaveLength(7);
    expect(chart.rows[5]).toEqual({ date: "2026-09-28", c0: 3, c1: 2 });
    expect(chart.rows[6]).toEqual({ date: "2026-09-29", c0: 1, c1: 0 });
    expect(chart.rows[0]).toEqual({ date: "2026-09-23", c0: 0, c1: 0 });
  });

  it("has no categories when nothing sold", async () => {
    const { pivotCategories } = await import("../statsRange");
    expect(pivotCategories([], "7d", now).categories).toEqual([]);
  });
});
