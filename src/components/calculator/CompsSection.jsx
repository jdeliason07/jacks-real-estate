import { Home, Plus, Minus, AlertTriangle } from "lucide-react";
import { fmt } from "../../lib/deal.js";
import { bodyFont, bodyFontLight, displayFont } from "../../lib/fonts.js";
import { inputClass } from "../../lib/ui.js";

export default function CompsSection({ state, deal, set, updateComp, addComp, removeComp }) {
  const { comps, arvOverride, arvManual } = state;
  const { compValues, avgComp, arvMissing } = deal;

  return (
    <section className="mb-6 bg-blue-900 border-2 border-teal-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Home className="w-6 h-6 text-teal-400" strokeWidth={2.5} />
        <h2 className="text-2xl text-teal-400" style={displayFont}>Comparable Sales</h2>
      </div>
      <p className="text-blue-300 text-lg mb-4" style={bodyFontLight}>
        Sold comps, last 6 months, 0.5mi radius, similar size/beds/baths, fully renovated.
      </p>

      <div className="space-y-3">
        {comps.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2">
            <span className="text-blue-400 text-xl w-5" style={bodyFont}>{i + 1}</span>
            <span className="text-blue-400 text-xl">$</span>
            <input
              type="number"
              value={c.price}
              onChange={(e) => updateComp(c.id, e.target.value)}
              placeholder="0"
              className={inputClass}
              style={bodyFont}
            />
            <button
              onClick={() => removeComp(c.id)}
              disabled={comps.length <= 1}
              className="p-2 text-blue-400 hover:text-violet-400 disabled:opacity-30"
              aria-label="Remove comp"
            >
              <Minus className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addComp}
        disabled={comps.length >= 6}
        className="mt-3 flex items-center gap-1 text-lg text-teal-400 hover:text-teal-300 disabled:opacity-30"
        style={bodyFont}
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} /> Add a comp
      </button>

      <div className="mt-4 pt-4 border-t border-blue-800">
        <label className="flex items-center gap-2 text-lg text-blue-300 cursor-pointer" style={bodyFontLight}>
          <input type="checkbox" checked={arvOverride} onChange={(e) => set({ arvOverride: e.target.checked })} className="accent-teal-500" />
          Override ARV manually
        </label>
      </div>

      {arvOverride ? (
        <>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-blue-400 text-xl">$</span>
            <input type="number" value={arvManual} onChange={(e) => set({ arvManual: e.target.value })} placeholder="Manual ARV" className={inputClass} style={bodyFont} />
          </div>
          {arvMissing && (
            <p className="mt-2 flex items-center gap-1 text-base text-amber-400" style={bodyFontLight}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} /> Enter a manual ARV, or uncheck to use the comp average.
            </p>
          )}
        </>
      ) : (
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-lg text-blue-300" style={bodyFontLight}>
            Average of {compValues.length} comp{compValues.length !== 1 ? "s" : ""} = ARV
          </span>
          <span className="text-3xl font-bold text-teal-400" style={bodyFont}>{fmt(avgComp)}</span>
        </div>
      )}
    </section>
  );
}
