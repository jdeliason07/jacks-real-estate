import { useState, useEffect, useRef } from "react";
import { computeDeal, REHAB_TIERS } from "../../lib/deal.js";
import { bodyFontLight, displayFont } from "../../lib/fonts.js";
import CompsSection from "./CompsSection.jsx";
import RehabSection from "./RehabSection.jsx";
import TermsSection from "./TermsSection.jsx";
import LedgerSection from "./LedgerSection.jsx";

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

export default function DealCalculator() {
  const [state, setState] = useState(loadInitialState);

  // Persist every change so a field deal survives a refresh.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable — non-fatal
    }
  }, [state]);

  // Keep the comp id counter ahead of any restored ids.
  const idCounter = useRef(Math.max(0, ...state.comps.map((c) => c.id)) + 1);

  const deal = computeDeal(state);

  function set(patch) {
    setState((s) => ({ ...s, ...patch }));
  }
  function updateComp(id, price) {
    setState((s) => ({ ...s, comps: s.comps.map((c) => (c.id === id ? { ...c, price } : c)) }));
  }
  function addComp() {
    setState((s) => (s.comps.length >= 6 ? s : { ...s, comps: [...s.comps, { id: idCounter.current++, price: "" }] }));
  }
  function removeComp(id) {
    setState((s) => (s.comps.length <= 1 ? s : { ...s, comps: s.comps.filter((c) => c.id !== id) }));
  }
  function selectTier(key) {
    const t = REHAB_TIERS[key];
    set({ tier: key, perSqft: String(Math.round((t.min + t.max) / 2)) });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-teal-400 text-sm mb-2" style={displayFont}>FIELD UNDERWRITING WORKSHEET</p>
        <h1 className="text-4xl sm:text-5xl text-teal-400 font-bold mb-2" style={{ ...displayFont, textShadow: "4px 4px 0 rgba(124,58,237,0.55)" }}>
          Deal Calculator
        </h1>
        <p className="text-blue-300 text-lg" style={bodyFontLight}>ARV -&gt; Rehab -&gt; 70% Rule -&gt; Target Price</p>
      </div>

      <CompsSection state={state} deal={deal} set={set} updateComp={updateComp} addComp={addComp} removeComp={removeComp} />
      <RehabSection state={state} deal={deal} set={set} selectTier={selectTier} />
      <TermsSection state={state} set={set} />
      <LedgerSection state={state} deal={deal} />

      <p className="text-blue-400 text-base text-center" style={bodyFontLight}>
        Rule-of-thumb estimates only - confirm with your buyer's numbers and the listing agent before contract.
      </p>
    </div>
  );
}
