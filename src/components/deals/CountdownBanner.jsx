import { Clock, AlertTriangle, CalendarClock } from "lucide-react";
import useCountdown from "../../lib/useCountdown.js";
import { formatDate } from "../../lib/countdown.js";
import { alertClass, tone } from "../../lib/tokens.js";
import { bodyFontLight, displayFont } from "../../lib/fonts.js";

/**
 * The DD deadline, front and centre. Computed live from the stored date — see
 * useCountdown — never a number written down at promotion time.
 */
export default function CountdownBanner({ date, className = "" }) {
  const label = useCountdown(date);
  const t = tone(label.tone);
  const Icon = !label.isSet ? CalendarClock : label.days <= 0 ? AlertTriangle : Clock;

  return (
    <div
      // Only the states that need a decision today interrupt a screen reader.
      role={label.tone === "warn" ? "alert" : undefined}
      className={alertClass(label.tone, { heavy: label.heavy }) + " items-center " + className}
    >
      <Icon className={"w-7 h-7 flex-shrink-0 " + t.icon} strokeWidth={2.5} />
      <div className="min-w-0">
        <p className={label.heavy ? "text-2xl leading-tight" : "text-xl leading-tight"} style={displayFont}>
          {label.text}
        </p>
        <p className="text-base text-blue-400 mt-0.5" style={bodyFontLight}>
          {label.isSet ? `Inspection period ends ${formatDate(date)}` : "Add a due-diligence end date to start the clock"}
        </p>
      </div>
    </div>
  );
}
