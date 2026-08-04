import { Link } from "react-router-dom";
import { displayFont } from "../lib/fonts.js";

// Minimal top bar with the brand mark, linking home. Reused by inner pages.
export default function Nav() {
  return (
    <header className="max-w-5xl mx-auto px-4 pt-6">
      <Link to="/" className="text-2xl text-teal-400 hover:text-teal-300" style={displayFont}>
        Jack&apos;s Realty
      </Link>
    </header>
  );
}
