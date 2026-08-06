// Due-diligence deadline countdown. Pure — no React, no DOM — so the edge
// cases that actually matter (today, overdue, month boundaries, DST) are unit
// tested rather than eyeballed.
//
// Never stored. The days remaining are always derived from the stored date and
// the current clock, so a card left open overnight can't show a stale number.

/**
 * Parse a YYYY-MM-DD date input as **local** midnight.
 *
 * `new Date("2026-08-06")` parses as UTC midnight, which is the previous
 * calendar day in every US timezone — that alone would report a deadline a day
 * early. Splitting the parts and using the Date(y, m, d) constructor keeps it
 * in the user's own calendar, which is the one the contract is written in.
 */
export function parseLocalDate(dateStr) {
  if (typeof dateStr !== "string") return null;
  const m = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  const date = new Date(y, mo - 1, d);
  // Rejects impossible dates that would otherwise roll over (2026-02-30).
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

/** Midnight at the start of whatever local day `d` falls in. */
function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Whole calendar days from today until `dateStr`. Positive = future, 0 = today,
 * negative = past. Returns null when there's no usable date.
 *
 * Rounds rather than truncates because a day is 23 or 25 hours across a DST
 * change, which would otherwise drop or add a day twice a year.
 */
export function daysUntil(dateStr, now = new Date()) {
  const target = parseLocalDate(dateStr);
  if (!target) return null;
  return Math.round((target - startOfDay(now)) / 86400000);
}

/** Runway thresholds, in days. Above COMFORTABLE it's teal; at or below TIGHT the card shouts. */
export const COMFORTABLE_DAYS = 7;
export const TIGHT_DAYS = 3;

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Turn a day count into what the card should say and how loudly.
 *
 * Colour escalates teal → violet, then amber for the two states that need a
 * decision today. Between violet steps the emphasis (border weight + fill)
 * carries the urgency instead of a fourth hue.
 *
 *   days >= 8  →  "12 days until DD deadline"      teal
 *   4..7       →  "6 days until DD deadline"       violet
 *   1..3       →  "2 days until DD deadline"       violet, heavy
 *   0          →  "Due today"                      amber, heavy
 *   < 0        →  "Past deadline — 3 days overdue" amber, heavy
 */
export function countdownLabel(days) {
  if (days === null || days === undefined || !Number.isFinite(days)) {
    return { text: "No DD deadline set", tone: "info", heavy: false, isSet: false, days: null };
  }
  if (days < 0) {
    return {
      text: `Past deadline — ${plural(-days, "day")} overdue`,
      tone: "warn",
      heavy: true,
      isSet: true,
      days,
    };
  }
  if (days === 0) {
    return { text: "Due today", tone: "warn", heavy: true, isSet: true, days };
  }
  return {
    text: `${plural(days, "day")} until DD deadline`,
    tone: days > COMFORTABLE_DAYS ? "good" : "info",
    heavy: days <= TIGHT_DAYS,
    isSet: true,
    days,
  };
}

/** Convenience: date string straight to a label. */
export function countdownFor(dateStr, now = new Date()) {
  return countdownLabel(daysUntil(dateStr, now));
}

/** "Aug 6, 2026" — for reading a stored date back on a card or notice. */
export function formatDate(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** "Monday, August 6, 2026" — the long form a legal notice wants. */
export function formatDateLong(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return "____________________";
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
