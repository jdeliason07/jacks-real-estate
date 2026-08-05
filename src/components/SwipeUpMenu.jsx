import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Calculator, Users } from "lucide-react";
import { displayFont } from "../lib/fonts.js";

// Destinations shown in the landing sheet. Add to this list as pages ship.
const LINKS = [
  { label: "Deal Calculator", to: "/calculator", icon: Calculator },
  { label: "Buyers", to: "/buyers", icon: Users },
];

const SWIPE_THRESHOLD = 45; // px of upward travel that counts as a swipe

/**
 * Landing-page navigation: hidden until the user swipes up (or taps the hint,
 * scrolls, or presses Up/Enter), then a sheet slides in from the bottom.
 * Swiping back down, tapping the backdrop, or Escape dismisses it.
 */
export default function SwipeUpMenu() {
  const [open, setOpen] = useState(false);
  const startY = useRef(null);

  // Whole-page gestures: swipe up to open, swipe down to close.
  useEffect(() => {
    function onTouchStart(e) {
      startY.current = e.touches[0].clientY;
    }
    function onTouchEnd(e) {
      if (startY.current == null) return;
      const delta = e.changedTouches[0].clientY - startY.current;
      if (delta < -SWIPE_THRESHOLD) setOpen(true);
      else if (delta > SWIPE_THRESHOLD) setOpen(false);
      startY.current = null;
    }
    // Desktop equivalents so the page isn't touch-only.
    function onWheel(e) {
      if (e.deltaY > 12) setOpen(true);
      else if (e.deltaY < -12) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape" || e.key === "ArrowDown") setOpen(false);
      else if (e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") setOpen(true);
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={
          "fixed inset-0 z-20 bg-blue-950/60 backdrop-blur-sm transition-opacity duration-300 " +
          (open ? "opacity-100" : "opacity-0 pointer-events-none")
        }
      />

      {/* Sheet */}
      <nav
        className={
          "fixed left-0 right-0 bottom-0 z-30 rounded-t-3xl border-t-2 border-x-2 border-teal-700 bg-blue-900 transition-transform duration-300 ease-out " +
          (open ? "translate-y-0" : "translate-y-full")
        }
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
      >
        {/* Grab handle — drag it down to dismiss */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="w-full pt-3 pb-2 flex justify-center"
        >
          <span className="block w-12 h-1.5 rounded-full bg-blue-700" />
        </button>

        <div className="max-w-md mx-auto px-5 pt-2">
          {LINKS.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-5 py-4 mb-3 rounded-xl border-2 border-teal-600 bg-blue-950 text-teal-300 text-2xl hover:bg-blue-800 transition-colors"
              style={displayFont}
            >
              <Icon className="w-6 h-6 flex-shrink-0" strokeWidth={2.5} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
