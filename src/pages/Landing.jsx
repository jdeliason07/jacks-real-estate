import { Link } from "react-router-dom";
import { Calculator, ArrowRight } from "lucide-react";
import Background from "../components/Background.jsx";
import { bodyFontLight, displayFont } from "../lib/fonts.js";

// Deliberately minimal landing page. This is the home of the site; more
// pages (deals, portfolio, contact) will hang off the same router later.
export default function Landing() {
  return (
    <Background>
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1
          className="text-5xl sm:text-7xl text-teal-400 font-bold mb-4"
          style={{ ...displayFont, textShadow: "4px 4px 0 rgba(124,58,237,0.55)" }}
        >
          Jack&apos;s Realty
        </h1>
        <p className="text-blue-300 text-xl mb-10" style={bodyFontLight}>
          Real estate investing, run by the numbers.
        </p>

        <Link
          to="/calculator"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-teal-500 bg-blue-900 text-teal-300 text-2xl hover:bg-blue-800 transition-colors"
          style={displayFont}
        >
          <Calculator className="w-6 h-6" strokeWidth={2.5} />
          Deal Calculator
          <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
        </Link>

        <p className="mt-16 text-blue-500 text-base" style={bodyFontLight}>
          More coming soon.
        </p>
      </div>
    </Background>
  );
}
