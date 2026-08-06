import { useState } from "react";
import { FileSignature, AlertTriangle } from "lucide-react";
import Field from "../Field.jsx";
import { liveFieldsFrom } from "../../lib/dealsSchema.js";
import { alertClass, cardTealClass, primaryButtonClass, secondaryButtonClass } from "../../lib/tokens.js";
import { bodyFont, bodyFontLight, displayFont } from "../../lib/fonts.js";

/**
 * The prospective → live step. Collects only what the Live tab needs; every
 * underwriting field carries over untouched, which is the whole point — you
 * should never have to re-key comps because a seller signed.
 */
export default function PromoteToLiveForm({ deal, onSubmit, onCancel }) {
  const [f, setF] = useState(() => liveFieldsFrom(deal));
  const [error, setError] = useState("");

  const set = (patch) => setF((s) => ({ ...s, ...patch }));

  function submit(e) {
    e.preventDefault();
    // Everything else can be filled in later; without this date there's no
    // countdown, and the countdown is the reason the Live tab exists.
    if (!f.ddEndDate) {
      setError("Set the due-diligence end date — that's the deadline the countdown runs against.");
      return;
    }
    setError("");
    onSubmit(f);
  }

  return (
    <form onSubmit={submit} className={cardTealClass + " mb-6"} noValidate>
      <div className="flex items-center gap-2 mb-2">
        <FileSignature className="w-6 h-6 text-teal-400" strokeWidth={2.5} />
        <h2 className="text-2xl text-teal-400" style={displayFont}>Move to Live</h2>
      </div>
      <p className="text-blue-300 text-lg mb-4" style={bodyFontLight}>
        Purchase agreement signed. Your comps, rehab and rule % stay exactly as they are.
      </p>

      {error && (
        <div role="alert" className={alertClass("warn") + " mb-4"}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1 text-amber-400" strokeWidth={2.5} />
          <span className="text-lg" style={bodyFontLight}>{error}</span>
        </div>
      )}

      <Field label="Contract price ($)" numeric value={f.contractPrice} onChange={(v) => set({ contractPrice: v })} hint="Pre-filled from your target price." />
      <Field label="Assignment fee ($)" numeric value={f.assignmentFee} onChange={(v) => set({ assignmentFee: v })} />
      <Field label="PA signed date" type="date" value={f.paSignedDate} onChange={(v) => set({ paSignedDate: v })} />
      <Field
        label="DD / inspection period ends"
        type="date"
        value={f.ddEndDate}
        onChange={(v) => set({ ddEndDate: v })}
        hint="The only date you enter by hand — the countdown is computed from it."
      />
      <Field label="Projected close date" type="date" value={f.projectedCloseDate} onChange={(v) => set({ projectedCloseDate: v })} />

      <div className="flex gap-2 mt-6">
        <button type="button" onClick={onCancel} className={secondaryButtonClass + " flex-1"} style={bodyFont}>
          Cancel
        </button>
        <button type="submit" className={primaryButtonClass + " flex-1"} style={displayFont}>
          Go Live
        </button>
      </div>
    </form>
  );
}
