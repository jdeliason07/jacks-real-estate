import { useState, useEffect } from "react";
import { computeDeal, REHAB_TIERS } from "../../lib/deal.js";
import { bodyFontLight, displayFont } from "../../lib/fonts.js";
import CompsSection from "./CompsSection.jsx";
import RehabSection from "./RehabSection.jsx";
import TermsSection from "./TermsSection.jsx";
import LedgerSection from "./LedgerSection.jsx";
import MatchingBuyers from "./MatchingBuyers.jsx";

const STORAGE_KEY = "jacks-realty-deal-v1";

const DEFAULT_STATE = {
  comps: [
    { id: 1, price: "210000" },
    { id: 2, price: "215000" },
    { id: 3, price: "205000" },
  ],
  arvOverride: false,
  arvManual: "",
  sqft: "1200",
  tier: "moderate",
  perSqft: "35",
  rehabOverride: false,
  rehabManual: "",
  rulePercent: "70",
  fee: "5000",
  listingPrice: "80000",
};

function loadInitialState() {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const saved = JSON.parse(raw);
    // Merge onto defaults so new fields always exist even for old saves.
    return { ...DEFAULT_STATE, ...saved };
  } catch {
    return DEFAULT_STATE;
  }
}

/**
 * The underwriting worksheet. Works two ways:
 *
 *   <DealCalculator />                          the scratchpad at /calculator —
 *                                               owns its state, persists to its
 *                                               own localStorage key
 *
 *   <DealCalculator state={s} onChange={fn} />  controlled, for a pipeline deal:
 *                                               the parent owns the numbers and
 *                                               saves them onto the deal record
 *
 * The scratchpad and a pipeline deal are separate stores on purpose — opening a
 * deal from the dashboard must not overwrite whatever is on the scratchpad.
 */
export default function DealCalculator({ state: controlledState, onChange, showHeader = true }) {
  const controlled = controlledState != null && typeof onChange === "function";

  const [ownState, setOwnState] = useState(() => (controlled ? DEFAULT_STATE : loadInitialState()));
  const state = controlled ? controlledState : ownState;

  // Persist every change so a field deal survives a refresh. When controlled,
  // the parent decides where (and how often) the numbers get written.
  useEffect(() => {
    if (controlled) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ownState));
    } catch {
      // storage full or unavailable — non-fatal
    }
  }, [ownState, controlled]);

  const deal = computeDeal(state);

  function apply(updater) {
    if (controlled) onChange(typeof updater === "function" ? updater(state) : updater);
    else setOwnState(updater);
  }

  function set(patch) {
    apply((s) => ({ ...s, ...patch }));
  }
  function updateComp(id, price) {
    apply((s) => ({ ...s, comps: s.comps.map((c) => (c.id === id ? { ...c, price } : c)) }));
  }
  function addComp() {
    apply((s) => {
      if (s.comps.length >= 6) return s;
      // Derive the next id from the comps themselves — a ref couldn't stay in
      // step with comps supplied from outside.
      const nextId = s.comps.reduce((max, c) => Math.max(max, c.id || 0), 0) + 1;
      return { ...s, comps: [...s.comps, { id: nextId, price: "" }] };
    });
  }
  function removeComp(id) {
    apply((s) => (s.comps.length <= 1 ? s : { ...s, comps: s.comps.filter((c) => c.id !== id) }));
  }
  function selectTier(key) {
    const t = REHAB_TIERS[key];
    set({ tier: key, perSqft: String(Math.round((t.min + t.max) / 2)) });
  }

  return (
    <div className={showHeader ? "max-w-2xl mx-auto px-4 py-10" : ""}>
      {showHeader && (
        <div className="mb-8 text-center">
          <p className="text-teal-400 text-sm mb-2" style={displayFont}>FIELD UNDERWRITING WORKSHEET</p>
          <h1 className="text-4xl sm:text-5xl text-teal-400 font-bold mb-2" style={{ ...displayFont, textShadow: "4px 4px 0 rgba(124,58,237,0.55)" }}>
            Deal Calculator
          </h1>
          <p className="text-blue-300 text-lg" style={bodyFontLight}>ARV -&gt; Rehab -&gt; 70% Rule -&gt; Target Price</p>
        </div>
      )}

      <CompsSection state={state} deal={deal} set={set} updateComp={updateComp} addComp={addComp} removeComp={removeComp} />
      <RehabSection state={state} deal={deal} set={set} selectTier={selectTier} />
      <TermsSection state={state} set={set} />
      <LedgerSection state={state} deal={deal} />
      <MatchingBuyers deal={deal} />

      <p className="text-blue-400 text-base text-center" style={bodyFontLight}>
        Rule-of-thumb estimates only - confirm with your buyer's numbers and the listing agent before contract.
      </p>
    </div>
  );
}
