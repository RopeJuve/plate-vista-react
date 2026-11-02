import { describe, expect, it } from "vitest";
import {
  byTableNumber,
  openOrderCount,
  parseNewTable,
  tableNumbersById,
  toQrTables,
  toTableList,
} from "../tableList";

const one = { _id: "t1", tableNumber: 1, qrCode: "qr-1" };
const two = { _id: "t2", tableNumber: "2", qrCode: "qr-2", orders: ["o1", "o2"] };
const ten = { _id: "t10", tableNumber: 10 };

describe("table list", () => {
  it("reads a bare list or one wrapped in `tables`", () => {
    expect(toTableList([one])).toEqual([one]);
    expect(toTableList({ tables: [one] })).toEqual([one]);
    expect(toTableList({ tables: "nope" })).toEqual([]);
    expect(toTableList(null)).toEqual([]);
  });

  it("sorts by number, not by text, without touching the input", () => {
    const tables = [ten, two, one];
    expect(byTableNumber(tables).map((table) => table._id)).toEqual(["t1", "t2", "t10"]);
    expect(tables[0]).toBe(ten);
  });

  it("maps ids to numbers, skipping tables without either", () => {
    expect(tableNumbersById([one, two, { tableNumber: 3 }, { _id: "x", tableNumber: "abc" }])).toEqual({
      t1: 1,
      t2: 2,
    });
  });

  it("offers a QR card only for tables that have a code", () => {
    expect(toQrTables([one, ten])).toEqual([{ _id: "t1", tableNumber: 1, qrCode: "qr-1" }]);
  });

  it("counts the open orders a table lists", () => {
    expect(openOrderCount(two)).toBe(2);
    expect(openOrderCount(one)).toBe(0);
  });

  it("accepts a new table only with a whole number and at least one seat", () => {
    expect(parseNewTable("4", "6")).toEqual({ tableNumber: 4, capacity: 6 });
    expect(parseNewTable("0", "6")).toBeNull();
    expect(parseNewTable("4", "1.5")).toBeNull();
    expect(parseNewTable("", "2")).toBeNull();
  });
});
