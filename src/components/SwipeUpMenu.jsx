import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calculator, Users, Home, ClipboardList } from "lucide-react";
import { displayFont } from "../lib/fonts.js";

// Destinations. "Home" is dropped on the landing page itself.
const LINKS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Deals", to: "/deals", icon: ClipboardList },
  { label: "Deal Calculator", to: "/calculator", icon: Calculator },
  { label: "Buyers", to: "/buyers", icon: Users },
];

const SWIPE_THRESHOLD = 45; // px of travel that counts as a swipe
const BOTTOM_SLOP = 6; // px of tolerance when deciding "at the bottom"

// True when the page can scroll no further down. Short pages (the landing
// page) are always at the bottom, so the gesture works there immediately.
function atPageBottom() {
  const doc = document.documentElement;
  return window.innerHeight + window.scrollY >= doc.scrollHeight - BOTTOM_SLOP;
}

/**
 * Site navigation revealed by swiping up. The gesture only opens the menu when
 * it *starts* with the page already scrolled to the bottom, so ordinary
 * mid-page swipes scroll as normal and never trip the menu. Swiping back down,
 * tapping the backdrop or handle, or pressing Escape dismisses it.
 */
export default function SwipeUpMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const firstLinkRef = useRef(null);

  const links = pathname === "/" ? LINKS.filter((l) => l.to !== "/") : LINKS;

  useEffect(() => {
    let startY = null;
    let startedAtBottom = false;

    function onTouchStart(e) {
      startY = e.touches[0].clientY;
      // Decide up front: if the gesture began mid-page, it's a scroll, even if
      // it happens to reach the bottom before the finger lifts.
      startedAtBottom = atPageBottom();
    }
    function onTouchEnd(e) {
      if (startY == null) return;
      const delta = e.changedTouches[0].clientY - startY;
      if (open) {
        if (delta > SWIPE_THRESHOLD) setOpen(false);
      } else if (startedAtBottom && delta < -SWIPE_THRESHOLD) {
        setOpen(true);
      }
      startY = null;
    }
    // Desktop equivalent: keep scrolling past the bottom to open.
    function onWheel(e) {
      if (open) {
        if (e.deltaY < -12) setOpen(false);
      } else if (e.deltaY > 12 && atPageBottom()) {
        setOpen(true);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
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
  }, [open]);

  // Don't let the page scroll behind the open sheet, and move focus into it so
  // keyboard and screen-reader users land on the menu they just opened.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on navigation so the sheet isn't still up on the next page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
        aria-label="Site menu"
        aria-hidden={!open}
        className={
          "fixed left-0 right-0 bottom-0 z-30 rounded-t-3xl border-t-2 border-x-2 border-teal-700 bg-blue-900 transition-transform duration-300 ease-out " +
          (open ? "translate-y-0" : "translate-y-full")
        }
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
      >
        {/* Grab handle — tap or swipe down to dismiss */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="w-full pt-3 pb-2 flex justify-center"
        >
          <span className="block w-12 h-1.5 rounded-full bg-blue-700" />
        </button>

        <div className="max-w-md mx-auto px-5 pt-2">
          {links.map(({ label, to, icon: Icon }, i) => (
            <Link
              key={to}
              to={to}
              ref={i === 0 ? firstLinkRef : undefined}
              tabIndex={open ? 0 : -1}
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
