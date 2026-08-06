import { describe, it, expect } from "vitest";
import {
  parseLocalDate, daysUntil, countdownLabel, countdownFor, formatDate,
} from "./countdown.js";

// A fixed "now" so these never depend on the day the suite runs.
const NOW = new Date(2026, 7, 6, 14, 30); // 6 Aug 2026, 2:30pm local

describe("parseLocalDate", () => {
  it("parses YYYY-MM-DD at local midnight, not UTC", () => {
    const d = parseLocalDate("2026-08-06");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(6);
    expect(d.getHours()).toBe(0);
  });

  it("rejects anything that isn't a real calendar date", () => {
    expect(parseLocalDate("")).toBeNull();
    expect(parseLocalDate("not a date")).toBeNull();
    expect(parseLocalDate("2026-2-3")).toBeNull();
    expect(parseLocalDate("2026-02-30")).toBeNull(); // would silently roll to Mar 2
    expect(parseLocalDate(null)).toBeNull();
    expect(parseLocalDate(undefined)).toBeNull();
  });
});

describe("daysUntil", () => {
  it("counts whole calendar days regardless of the time of day", () => {
    expect(daysUntil("2026-08-12", NOW)).toBe(6);
    expect(daysUntil("2026-08-07", NOW)).toBe(1);
  });

  it("returns 0 for today, even late in the afternoon", () => {
    expect(daysUntil("2026-08-06", NOW)).toBe(0);
    expect(daysUntil("2026-08-06", new Date(2026, 7, 6, 23, 59))).toBe(0);
  });

  it("goes negative once the date has passed", () => {
    expect(daysUntil("2026-08-03", NOW)).toBe(-3);
    expect(daysUntil("2026-08-05", NOW)).toBe(-1);
  });

  it("crosses month and year boundaries", () => {
    expect(daysUntil("2026-09-01", new Date(2026, 7, 31, 9))).toBe(1);
    expect(daysUntil("2027-01-01", new Date(2026, 11, 31, 9))).toBe(1);
    expect(daysUntil("2026-03-01", new Date(2026, 1, 28, 9))).toBe(1); // 2026 isn't a leap year
  });

  it("stays whole across a DST change", () => {
    // US DST starts 8 Mar 2026 — that local day is only 23 hours long, which
    // fractional millisecond math would round down to 6 days.
    expect(daysUntil("2026-03-14", new Date(2026, 2, 7, 12))).toBe(7);
    // ...and ends 1 Nov 2026, a 25-hour day.
    expect(daysUntil("2026-11-07", new Date(2026, 9, 31, 12))).toBe(7);
  });

  it("returns null when there's no date", () => {
    expect(daysUntil("", NOW)).toBeNull();
    expect(daysUntil(null, NOW)).toBeNull();
  });
});

describe("countdownLabel", () => {
  it("stays teal while there's comfortable runway", () => {
    expect(countdownLabel(12)).toMatchObject({ text: "12 days until DD deadline", tone: "good", heavy: false });
    expect(countdownLabel(8).tone).toBe("good");
  });

  it("shifts to violet as the deadline tightens", () => {
    expect(countdownLabel(7)).toMatchObject({ tone: "info", heavy: false });
    expect(countdownLabel(4).tone).toBe("info");
  });

  it("keeps violet but adds weight inside three days — no new colour", () => {
    expect(countdownLabel(3)).toMatchObject({ tone: "info", heavy: true });
    expect(countdownLabel(1)).toMatchObject({ text: "1 day until DD deadline", tone: "info", heavy: true });
  });

  it("says 'Due today' rather than counting zero", () => {
    expect(countdownLabel(0)).toMatchObject({ text: "Due today", tone: "warn", heavy: true, isSet: true });
  });

  it("spells out how far past the deadline it is instead of showing a negative", () => {
    expect(countdownLabel(-1).text).toBe("Past deadline — 1 day overdue");
    expect(countdownLabel(-3)).toMatchObject({ text: "Past deadline — 3 days overdue", tone: "warn", heavy: true });
  });

  it("handles a deal with no deadline set", () => {
    expect(countdownLabel(null)).toMatchObject({ text: "No DD deadline set", isSet: false, days: null });
    expect(countdownLabel(undefined).isSet).toBe(false);
    expect(countdownLabel(NaN).isSet).toBe(false);
  });
});

describe("countdownFor", () => {
  it("goes straight from a stored date to a rendered label", () => {
    expect(countdownFor("2026-08-12", NOW).text).toBe("6 days until DD deadline");
    expect(countdownFor("2026-08-06", NOW).text).toBe("Due today");
    expect(countdownFor("2026-08-04", NOW).text).toBe("Past deadline — 2 days overdue");
    expect(countdownFor("", NOW).isSet).toBe(false);
  });
});

describe("formatDate", () => {
  it("renders a stored date without slipping a day", () => {
    expect(formatDate("2026-08-06")).toBe("Aug 6, 2026");
    expect(formatDate("2026-01-01")).toBe("Jan 1, 2026");
  });

  it("falls back to a dash when nothing is set", () => {
    expect(formatDate("")).toBe("—");
  });
});
