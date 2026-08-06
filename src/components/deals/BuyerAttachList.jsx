import { useState } from "react";
import { Users, X, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { displayName } from "../../lib/buyers.js";
import { BUYER_STATUSES } from "../../lib/dealsSchema.js";
import { cardClass, chipClass, inputClass, secondaryButtonClass, emptyStateClass } from "../../lib/tokens.js";
import { bodyFont, bodyFontLight, displayFont } from "../../lib/fonts.js";

const STATUS_LABEL = { interested: "Interested", assigned: "Assigned", passed: "Passed" };

/**
 * Buyers circling this deal. The relationship is many-to-many in both
 * directions: one buyer can sit on several live deals at once, and a deal can
 * carry a whole shortlist while you work out who actually closes.
 */
export default function BuyerAttachList({ attached, allBuyers, onAttach, onDetach, onStatusChange }) {
  const [picked, setPicked] = useState("");

  const attachedIds = new Set(attached.map((l) => l.buyerId));
  const available = allBuyers.filter((b) => !attachedIds.has(b.id));

  function add() {
    if (!picked) return;
    onAttach(picked);
    setPicked("");
  }

  return (
    <section className={cardClass + " mb-6"}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-violet-400" strokeWidth={2.5} />
        <h2 className="text-2xl text-violet-400" style={displayFont}>Buyers on this deal</h2>
      </div>

      {attached.length === 0 ? (
        <div className={emptyStateClass + " mb-4"}>
          <p className="text-blue-400 text-lg" style={bodyFontLight}>
            {allBuyers.length ? "Nobody attached yet." : "Register a cash buyer first, then attach them here."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3 mb-4">
          {attached.map((l) => (
            <li key={l.buyerId} className="bg-blue-950 border-2 border-blue-800 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-xl text-blue-100 leading-tight" style={bodyFont}>{displayName(l.buyer)}</p>
                  {l.buyer.companyName && l.buyer.investorName && (
                    <p className="text-base text-blue-400" style={bodyFontLight}>{l.buyer.companyName}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDetach(l.buyerId)}
                  aria-label={`Remove ${displayName(l.buyer)} from this deal`}
                  className="p-1 rounded-lg text-blue-500 hover:text-amber-400 flex-shrink-0"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {BUYER_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onStatusChange(l.buyerId, s)}
                    aria-pressed={l.status === s}
                    className={chipClass(l.status === s)}
                    style={bodyFont}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {available.length > 0 ? (
        <div className="flex gap-2">
          <label htmlFor="attach-buyer" className="sr-only">Buyer to attach</label>
          <select
            id="attach-buyer"
            value={picked}
            onChange={(e) => setPicked(e.target.value)}
            className={inputClass + " flex-1"}
            style={bodyFont}
          >
            <option value="">Pick a buyer…</option>
            {available.map((b) => (
              <option key={b.id} value={b.id}>{displayName(b)}</option>
            ))}
          </select>
          <button type="button" onClick={add} disabled={!picked} className={secondaryButtonClass + " disabled:opacity-40"} style={bodyFont}>
            <Plus className="w-5 h-5" strokeWidth={2.5} /> Attach
          </button>
        </div>
      ) : (
        <p className="text-blue-500 text-base" style={bodyFontLight}>
          {allBuyers.length ? "Every buyer on file is already attached." : (
            <>Nothing to attach — <Link to="/buyers" className="text-teal-400 underline">register a buyer</Link> first.</>
          )}
        </p>
      )}
    </section>
  );
}
