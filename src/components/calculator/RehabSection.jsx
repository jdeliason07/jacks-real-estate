import { Hammer, AlertTriangle } from "lucide-react";
import { fmt, REHAB_TIERS } from "../../lib/deal.js";
import { bodyFont, bodyFontLight, displayFont } from "../../lib/fonts.js";
import { inputClass } from "../../lib/ui.js";

export default function RehabSection({ state, deal, set, selectTier }) {
  const { sqft, tier, perSqft, rehabOverride, rehabManual } = state;
  const { sqftNum, perSqftNum, rehabCalc, rehabMissing } = deal;

  return (
    <section className="mb-6 bg-blue-900 border-2 border-violet-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Hammer className="w-6 h-6 text-violet-400" strokeWidth={2.5} />
        <h2 className="text-2xl text-violet-400" style={displayFont}>Repair Estimate</h2>
      </div>
      <p className="text-blue-300 text-lg mb-4" style={bodyFontLight}>Rule-of-thumb rehab benchmark, based on photos and listing notes.</p>

      <div className="mb-4">
        <label className="text-lg text-blue-300 block mb-1" style={bodyFontLight}>Square footage</label>
        <input type="number" value={sqft} onChange={(e) => set({ sqft: e.target.value })} className={inputClass} style={bodyFont} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {Object.entries(REHAB_TIERS).map(([key, t]) => (
          <button
            key={key}
            onClick={() => selectTier(key)}
            className={"text-left p-3 rounded-lg border-2 " + (tier === key ? "border-violet-500 bg-violet-950" : "border-blue-800 bg-blue-950 hover:border-blue-600")}
          >
            <div className={(tier === key ? "text-violet-300" : "text-blue-300") + " text-lg font-bold mb-1"} style={bodyFont}>{t.label}</div>
            <div className="text-blue-400 text-base" style={bodyFontLight}>{t.range}</div>
          </button>
        ))}
      </div>
      <p className="text-blue-400 text-lg mb-4" style={bodyFontLight}>{REHAB_TIERS[tier].desc}</p>

      <div className="flex items-center gap-2 mb-4">
        <label className="text-lg text-blue-300 whitespace-nowrap" style={bodyFontLight}>$ / sqft</label>
        <input type="number" value={perSqft} onChange={(e) => set({ perSqft: e.target.value })} className="w-28 bg-blue-950 border-2 border-blue-800 rounded-lg px-3 py-2 text-blue-50 text-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" style={bodyFont} />
      </div>

      <div className="pt-4 border-t border-blue-800">
        <label className="flex items-center gap-2 text-lg text-blue-300 cursor-pointer" style={bodyFontLight}>
          <input type="checkbox" checked={rehabOverride} onChange={(e) => set({ rehabOverride: e.target.checked })} className="accent-teal-500" />
          Override total manually
        </label>
      </div>

      {rehabOverride ? (
        <>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-blue-400 text-xl">$</span>
            <input type="number" value={rehabManual} onChange={(e) => set({ rehabManual: e.target.value })} placeholder="Manual rehab total" className={inputClass} style={bodyFont} />
          </div>
          {rehabMissing && (
            <p className="mt-2 flex items-center gap-1 text-base text-amber-400" style={bodyFontLight}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} /> Enter a manual total, or uncheck to use sqft × $/sqft.
            </p>
          )}
        </>
      ) : (
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-lg text-blue-300" style={bodyFontLight}>{sqftNum.toLocaleString()} sqft x {fmt(perSqftNum)}</span>
          <span className="text-3xl font-bold text-violet-400" style={bodyFont}>{fmt(rehabCalc)}</span>
        </div>
      )}
    </section>
  );
}
