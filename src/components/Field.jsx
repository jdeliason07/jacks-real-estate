import { useId } from "react";
import { bodyFont, bodyFontLight } from "../lib/fonts.js";
import { inputClass } from "../lib/ui.js";

/**
 * Labelled input with a real label/input association (screen readers and
 * tap-the-label both work). Numeric fields get a mobile-friendly keypad and
 * ignore scroll-wheel changes, which otherwise silently alter values.
 */
export default function Field({
  label,
  value,
  onChange,
  type = "text",
  numeric = false,
  placeholder,
  hint,
  className = "",
  ...rest
}) {
  const id = useId();
  const isNum = numeric || type === "number";

  return (
    <div className={"mb-4 " + className}>
      <label htmlFor={id} className="text-lg text-blue-300 block mb-1" style={bodyFontLight}>
        {label}
      </label>
      <input
        id={id}
        type={isNum ? "number" : type}
        // Decimal keypad on phones instead of the full keyboard.
        inputMode={isNum ? "decimal" : undefined}
        // A stray scroll over a focused number input silently changes it.
        onWheel={isNum ? (e) => e.currentTarget.blur() : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
        style={bodyFont}
        {...rest}
      />
      {hint && (
        <p className="text-base text-blue-500 mt-1" style={bodyFontLight}>
          {hint}
        </p>
      )}
    </div>
  );
}
