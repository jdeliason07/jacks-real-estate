import { Calculator } from "lucide-react";
import { bodyFont, bodyFontLight, displayFont } from "../../lib/fonts.js";
import { inputClass } from "../../lib/ui.js";

export default function TermsSection({ state, set }) {
  const { rulePercent, fee, listingPrice } = state;

  return (
    <section className="mb-6 bg-blue-900 border-2 border-teal-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-6 h-6 text-teal-400" strokeWidth={2.5} />
        <h2 className="text-2xl text-teal-400" style={displayFont}>Deal Terms</h2>
      </div>
      <p className="text-blue-300 text-lg mb-4" style={bodyFontLight}>MAO = (ARV x Rule%) - Rehab - Fee</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-lg text-blue-300 block mb-1" style={bodyFontLight}>Rule %</label>
          <input type="number" value={rulePercent} onChange={(e) => set({ rulePercent: e.target.value })} className={inputClass} style={bodyFont} />
        </div>
        <div>
          <label className="text-lg text-blue-300 block mb-1" style={bodyFontLight}>Your fee ($)</label>
          <input type="number" value={fee} onChange={(e) => set({ fee: e.target.value })} className={inputClass} style={bodyFont} />
        </div>
      </div>

      <div>
        <label className="text-lg text-blue-300 block mb-1" style={bodyFontLight}>Listing price ($, optional)</label>
        <input type="number" value={listingPrice} onChange={(e) => set({ listingPrice: e.target.value })} placeholder="0" className={inputClass} style={bodyFont} />
      </div>
    </section>
  );
}
