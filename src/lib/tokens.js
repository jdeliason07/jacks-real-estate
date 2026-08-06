// Deep Sea Field Kit — the design tokens this site was already built with,
// gathered into one place. Nothing here is new: every value was lifted from an
// existing component so the dashboard can't drift from the rest of the app.
// See DESIGN.md for the guide these encode.
//
// Typography lives in fonts.js and inputs in ui.js — those are already tokens,
// so they're re-exported here to give new screens a single import.

import { bodyFont, bodyFontLight, displayFont } from "./fonts.js";

export { bodyFont, bodyFontLight, displayFont };
export { inputClass, numericProps } from "./ui.js";

// ---- Raw values -----------------------------------------------------------

/** The page background. Duplicated verbatim in ErrorBoundary — see DESIGN.md. */
export const deepSeaGradient = "linear-gradient(160deg, #020617 0%, #042f2e 50%, #1e1b4b 100%)";

export const accent = {
  abyss: "#020617", // page floor, theme-color, card fill at 65% alpha
  teal: "#14b8a6", // primary — "this is good"
  tealBright: "#2dd4bf",
  tealPale: "#ccfbf1",
  violet: "#7c3aed", // secondary — depth, emphasis, "pay attention"
  amber: "#f59e0b", // alarm only — never decorative
};

/** The hand-drawn depth shadow under every display heading. */
export const markerShadow = "4px 4px 0 rgba(124,58,237,0.55)";

/** Ready-made style object for page <h1>s. */
export const headingStyle = { ...displayFont, textShadow: markerShadow };

/** Teal→violet gradient fill, used on hero numbers. Apply to a text element. */
export const gradientTextStyle = {
  background: `linear-gradient(90deg, ${accent.teal}, ${accent.violet})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

// ---- State palette --------------------------------------------------------

/**
 * Three states, no more. Teal = comfortable, violet = tightening, amber =
 * alarm. Amber is deliberately scarce: it only ever means "act now".
 */
export const TONES = {
  good: { border: "border-teal-700", text: "text-teal-300", icon: "text-teal-400", fill: "bg-teal-950", hex: accent.teal },
  info: { border: "border-violet-700", text: "text-violet-300", icon: "text-violet-400", fill: "bg-violet-950", hex: accent.violet },
  warn: { border: "border-amber-600", text: "text-amber-300", icon: "text-amber-400", fill: "bg-amber-950", hex: accent.amber },
};

export function tone(name) {
  return TONES[name] || TONES.info;
}

/**
 * The border-only alert used across the app (BuyerForm, LedgerSection).
 * `heavy` thickens the border and adds a fill instead of introducing a colour —
 * that's how urgency escalates here.
 */
export function alertClass(name = "warn", { heavy = false } = {}) {
  const t = tone(name);
  return [
    "flex items-start gap-2 p-4 rounded-lg",
    heavy ? `border-4 ${t.fill}` : "border-2",
    t.border,
    t.text,
  ].join(" ");
}

// ---- Surfaces -------------------------------------------------------------

/** Standard content card. 12px radius (rounded-xl), violet edge. */
export const cardClass = "bg-blue-900 border-2 border-violet-700 rounded-xl p-6";

/** Same card, teal edge — for the "this one's healthy" variant. */
export const cardTealClass = "bg-blue-900 border-2 border-teal-700 rounded-xl p-6";

/** Recessed panel, one step darker than a card. */
export const panelClass = "bg-blue-950 border-2 border-blue-800 rounded-xl p-4";

/** "Nothing here yet" placeholder. */
export const emptyStateClass = "text-center py-12 border-2 border-dashed border-blue-800 rounded-xl";

// ---- Controls -------------------------------------------------------------

/** Full-width primary action. Display font, 12px radius. */
export const primaryButtonClass =
  "w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-teal-500 bg-teal-600 text-blue-950 text-2xl hover:bg-teal-500";

/** Quieter action. Body font, 8px radius. */
export const secondaryButtonClass =
  "flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-blue-700 bg-blue-950 text-blue-300 text-lg hover:bg-blue-800";

/** Destructive action — amber, matching the alarm state. */
export const dangerButtonClass =
  "flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-amber-700 bg-blue-950 text-amber-300 text-lg hover:bg-amber-950";

/** Toggle chip / tab / filter pill. Pass the pressed state. */
export function chipClass(active) {
  return (
    "px-3 py-2 rounded-lg border-2 text-base " +
    (active
      ? "border-teal-500 bg-teal-950 text-teal-200"
      : "border-blue-800 bg-blue-950 text-blue-400 hover:border-blue-600")
  );
}

/** Transient confirmation banner ("Backup downloaded."). */
export const flashClass =
  "p-3 rounded-lg border-2 border-teal-700 bg-teal-950 text-teal-200 text-lg text-center";
