import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu as MenuIcon, X } from "lucide-react";
import { bodyFont, bodyFontLight } from "../lib/fonts.js";

// Site navigation. Add new destinations here as pages get built.
const LINKS = [
  { label: "Home", to: "/" },
  { label: "Deal Calculator", to: "/calculator" },
  { label: "Properties", soon: true },
  { label: "About", soon: true },
];

// Fixed dropdown in the top-right corner, used on every page.
export default function Menu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="fixed top-4 right-4 z-30">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex items-center justify-center w-12 h-12 rounded-xl border-2 border-teal-600 bg-blue-900/80 backdrop-blur text-teal-300 hover:bg-blue-800 transition-colors"
      >
        {open ? <X className="w-6 h-6" strokeWidth={2.5} /> : <MenuIcon className="w-6 h-6" strokeWidth={2.5} />}
      </button>

      {open && (
        <nav className="absolute right-0 mt-2 w-56 rounded-xl border-2 border-teal-700 bg-blue-900 shadow-xl overflow-hidden">
          {LINKS.map((item) =>
            item.soon ? (
              <div
                key={item.label}
                className="flex items-center justify-between px-4 py-3 text-lg text-blue-500 border-b border-blue-800 last:border-b-0 cursor-default"
                style={bodyFontLight}
              >
                {item.label}
                <span className="text-xs text-blue-600" style={bodyFontLight}>soon</span>
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-lg text-teal-300 hover:bg-blue-800 border-b border-blue-800 last:border-b-0"
                style={bodyFont}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      )}
    </div>
  );
}
