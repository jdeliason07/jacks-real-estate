export const inputClass =
  "w-full bg-blue-950 border-2 border-blue-800 rounded-lg px-3 py-2 text-blue-50 text-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500";

/**
 * Spread onto numeric <input type="number"> fields: shows the decimal keypad
 * on phones, and blurs on wheel so an accidental scroll can't silently change
 * a dollar amount.
 */
export const numericProps = {
  inputMode: "decimal",
  onWheel: (e) => e.currentTarget.blur(),
};
