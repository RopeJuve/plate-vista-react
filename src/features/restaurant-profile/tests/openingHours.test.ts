import { describe, expect, it } from "vitest";
import {
  emptyHours,
  hasOpeningHours,
  hoursIssues,
  localClock,
  openStatus,
  weekRows,
} from "../openingHours";
import type { OpeningHours } from "../types";

const hours = (partial: Partial<OpeningHours>): OpeningHours => ({ ...emptyHours(), ...partial });

// 2026-11-16 is a Monday. 10:00 UTC is 11:00 in Berlin (CET, UTC+1).
const at = (iso: string) => new Date(iso);

describe("localClock", () => {
  it("reads the weekday and minutes in the restaurant's timezone, not the guest's", () => {
    expect(localClock(at("2026-11-16T10:00:00Z"), "Europe/Berlin")).toEqual({ day: "mon", minutes: 660 });
    expect(localClock(at("2026-11-16T23:30:00Z"), "Europe/Berlin")).toEqual({ day: "tue", minutes: 30 });
    expect(localClock(at("2026-11-16T10:00:00Z"), "America/New_York")).toEqual({ day: "mon", minutes: 300 });
  });
});

describe("openStatus", () => {
  const week = hours({
    mon: [{ open: "11:00", close: "15:00" }, { open: "17:00", close: "22:00" }],
    tue: [{ open: "11:00", close: "19:00" }],
    fri: [{ open: "18:00", close: "02:00" }],
  });
  const status = (iso: string) => openStatus(week, "Europe/Berlin", at(iso));

  it("is open until the current range closes", () => {
    expect(status("2026-11-16T10:30:00Z")).toEqual({ open: true, label: "Open", detail: "until 15:00" });
    expect(status("2026-11-16T16:00:00Z")).toEqual({ open: true, label: "Open", detail: "until 22:00" });
  });

  it("is closed between ranges and says when it opens again today", () => {
    expect(status("2026-11-16T14:30:00Z")).toEqual({ open: false, label: "Closed", detail: "opens 17:00" });
    expect(status("2026-11-16T08:00:00Z")).toEqual({ open: false, label: "Closed", detail: "opens 11:00" });
  });

  it("says tomorrow, or names the day further ahead", () => {
    expect(status("2026-11-16T22:00:00Z")).toEqual({ open: false, label: "Closed", detail: "opens 11:00 tomorrow" });
    // Tuesday evening: next opening is Friday.
    expect(status("2026-11-17T19:00:00Z")).toEqual({ open: false, label: "Closed", detail: "opens Fri 18:00" });
  });

  it("stays open past midnight from the day before", () => {
    // Saturday 01:00 Berlin = Saturday 00:00 UTC.
    expect(status("2026-11-21T00:00:00Z")).toEqual({ open: true, label: "Open", detail: "until 02:00" });
    expect(status("2026-11-21T02:00:00Z")).toEqual({ open: false, label: "Closed", detail: "opens Mon 11:00" });
  });

  it("is open at the opening minute and closed at the closing minute", () => {
    expect(status("2026-11-17T10:00:00Z")?.open).toBe(true);
    expect(status("2026-11-17T18:00:00Z")?.open).toBe(false);
  });

  it("has nothing to say without any opening hours", () => {
    expect(openStatus(emptyHours(), "Europe/Berlin", at("2026-11-16T10:00:00Z"))).toBeNull();
  });

  it("finds the same time a week later when only today has hours", () => {
    const mondaysOnly = hours({ mon: [{ open: "11:00", close: "12:00" }] });
    expect(openStatus(mondaysOnly, "Europe/Berlin", at("2026-11-16T12:00:00Z"))).toEqual({
      open: false,
      label: "Closed",
      detail: "opens Mon 11:00",
    });
  });
});

describe("weekRows", () => {
  it("lists every day from Monday, marks today, and says Closed for empty days", () => {
    const rows = weekRows(hours({ mon: [{ open: "11:00", close: "15:00" }, { open: "17:00", close: "22:00" }] }), "tue");
    expect(rows).toHaveLength(7);
    expect(rows[0]).toEqual({ day: "mon", label: "Monday", times: ["11:00–15:00", "17:00–22:00"], today: false });
    expect(rows[1]).toEqual({ day: "tue", label: "Tuesday", times: ["Closed"], today: true });
  });
});

describe("hasOpeningHours", () => {
  it("is false only when every day is empty", () => {
    expect(hasOpeningHours(emptyHours())).toBe(false);
    expect(hasOpeningHours(hours({ sun: [{ open: "10:00", close: "12:00" }] }))).toBe(true);
  });
});

describe("hoursIssues", () => {
  it("accepts ranges that touch and ranges past midnight", () => {
    expect(
      hoursIssues(
        hours({
          mon: [{ open: "11:00", close: "15:00" }, { open: "15:00", close: "22:00" }],
          fri: [{ open: "20:00", close: "03:00" }],
          sat: [{ open: "10:00", close: "14:00" }],
        })
      )
    ).toEqual({});
  });

  it("names each day with an empty, unfinished, or overlapping range", () => {
    expect(
      hoursIssues(
        hours({
          mon: [{ open: "11:00", close: "11:00" }],
          tue: [{ open: "", close: "12:00" }],
          wed: [{ open: "11:00", close: "15:00" }, { open: "14:00", close: "22:00" }],
          sat: [{ open: "20:00", close: "03:00" }],
          sun: [{ open: "02:00", close: "06:00" }],
        })
      )
    ).toEqual({
      mon: "Opening and closing time must differ",
      tue: "Enter both times",
      wed: "Opening times overlap",
      sun: "Opening times overlap",
    });
  });

  it("checks Sunday night into Monday morning", () => {
    expect(
      hoursIssues(hours({ sun: [{ open: "22:00", close: "04:00" }], mon: [{ open: "03:00", close: "08:00" }] }))
    ).toEqual({ mon: "Opening times overlap" });
  });
});
