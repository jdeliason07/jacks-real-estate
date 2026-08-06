import { useEffect, useState } from "react";
import { countdownFor } from "./countdown.js";

/**
 * Live countdown to a DD deadline. Recomputes on an interval *and* whenever the
 * tab becomes visible again.
 *
 * The visibility listener is the important half: this ships as an installed
 * PWA, so the usual case is a phone that's been asleep in a pocket for six
 * hours. Waking to a cached "6 days" when it's now 5 is exactly the failure
 * this component exists to prevent.
 */
export default function useCountdown(dateStr, intervalMs = 60000) {
  const [label, setLabel] = useState(() => countdownFor(dateStr));

  useEffect(() => {
    const tick = () => setLabel(countdownFor(dateStr));
    tick(); // re-sync immediately when the date itself changes

    const id = setInterval(tick, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [dateStr, intervalMs]);

  return label;
}
