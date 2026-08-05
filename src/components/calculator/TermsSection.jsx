import { Calculator } from "lucide-react";
import { bodyFontLight, displayFont } from "../../lib/fonts.js";
import Field from "../Field.jsx";

export default function TermsSection({ state, set }) {
  const { rulePercent, fee, listingPrice } = state;

  return (
    <section className="mb-6 bg-blue-900 border-2 border-teal-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-6 h-6 text-teal-400" strokeWidth={2.5} />
        <h2 className="text-2xl text-teal-400" style={displayFont}>Deal Terms</h2>
      </div>
      <p className="text-blue-300 text-lg mb-4" style={bodyFontLight}>MAO = (ARV x Rule%) - Rehab - Fee</p>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Rule %" numeric value={rulePercent} onChange={(v) => set({ rulePercent: v })} />
        <Field label="Your fee ($)" numeric value={fee} onChange={(v) => set({ fee: v })} />
      </div>

      <Field
        label="Listing price ($, optional)"
        numeric
        value={listingPrice}
        onChange={(v) => set({ listingPrice: v })}
        placeholder="0"
        className="mb-0"
      />
    </section>
  );
}
