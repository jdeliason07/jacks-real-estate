import { useState, useRef } from "react";
import { Home, Hammer, Calculator, Target, Plus, Minus, CheckCircle2, AlertTriangle } from "lucide-react";

const REHAB_TIERS = {
  light: { label: "Light Cosmetic", range: "$15-$25 / sqft", min: 15, max: 25, desc: "Paint, flooring, light fixtures, landscape cleanup" },
  moderate: { label: "Moderate Rehab", range: "$30-$50 / sqft", min: 30, max: 50, desc: "Kitchen & bath update, appliances, minor systems/roof" },
  heavy: { label: "Heavy / Full Gut", range: "$60-$90+ / sqft", min: 60, max: 90, desc: "Mechanicals, structural, new roof, frame-up" },
};

function fmt(n) {
  if (!isFinite(n)) return "$0";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const bodyFont = { fontFamily: "'Kalam', cursive", fontWeight: 700 };
const bodyFontLight = { fontFamily: "'Kalam', cursive", fontWeight: 400 };
const displayFont = { fontFamily: "'Permanent Marker', cursive" };

function Row({ label, value, muted, bold }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={(muted ? "text-blue-400" : "text-blue-300") + " text-lg"} style={bodyFontLight}>{label}</span>
      <span className={(bold ? "text-teal-300 font-bold text-2xl" : muted ? "text-blue-400 text-lg" : "text-blue-100 text-lg")} style={bodyFont}>{value}</span>
    </div>
  );
}

function Ring({ style }) {
  return <div className="fixed rounded-full pointer-events-none" style={style} />;
}

export default function DealCalculator() {
  const idCounter = useRef(4);

  const [comps, setComps] = useState([
    { id: 1, price: "210000" },
    { id: 2, price: "215000" },
    { id: 3, price: "205000" },
  ]);
  const [arvOverride, setArvOverride] = useState(false);
  const [arvManual, setArvManual] = useState("");

  const [sqft, setSqft] = useState("1200");
  const [tier, setTier] = useState("moderate");
  const [perSqft, setPerSqft] = useState("35");
  const [rehabOverride, setRehabOverride] = useState(false);
  const [rehabManual, setRehabManual] = useState("");

  const [rulePercent, setRulePercent] = useState("70");
  const [fee, setFee] = useState("5000");
  const [listingPrice, setListingPrice] = useState("80000");

  const compValues = comps.map((c) => parseFloat(c.price)).filter((n) => !isNaN(n) && n > 0);
  const avgComp = compValues.length ? compValues.reduce((a, b) => a + b, 0) / compValues.length : 0;
  const ARV = arvOverride ? parseFloat(arvManual) || 0 : avgComp;

  const sqftNum = parseFloat(sqft) || 0;
  const perSqftNum = parseFloat(perSqft) || 0;
  const rehabCalc = sqftNum * perSqftNum;
  const rehabTotal = rehabOverride ? parseFloat(rehabManual) || 0 : rehabCalc;

  const ruleNum = parseFloat(rulePercent) || 0;
  const feeNum = parseFloat(fee) || 0;
  const ruleAmount = ARV * (ruleNum / 100);
  const buyerMAO = ruleAmount - rehabTotal;
  const targetPrice = buyerMAO - feeNum;

  const listingNum = parseFloat(listingPrice) || 0;
  const hasListing = listingPrice !== "" && listingNum > 0;
  const gap = listingNum - targetPrice;

  function updateComp(id, price) {
    setComps(comps.map((c) => (c.id === id ? { ...c, price } : c)));
  }
  function addComp() {
    if (comps.length >= 6) return;
    setComps([...comps, { id: idCounter.current++, price: "" }]);
  }
  function removeComp(id) {
    if (comps.length <= 1) return;
    setComps(comps.filter((c) => c.id !== id));
  }
  function selectTier(key) {
    setTier(key);
    const t = REHAB_TIERS[key];
    setPerSqft(String(Math.round((t.min + t.max) / 2)));
  }

  const inputClass =
    "w-full bg-blue-950 border-2 border-blue-800 rounded-lg px-3 py-2 text-blue-50 text-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500";

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ ...bodyFont, background: "linear-gradient(160deg, #020617 0%, #042f2e 50%, #1e1b4b 100%)" }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Kalam:wght@400;700&display=swap');"}</style>

      <Ring style={{ bottom: "-160px", right: "-160px", width: "220px", height: "220px", border: "1px solid rgba(45,212,191,0.25)" }} />
      <Ring style={{ bottom: "-220px", right: "-220px", width: "380px", height: "380px", border: "1px solid rgba(124,58,237,0.22)" }} />
      <Ring style={{ bottom: "-280px", right: "-280px", width: "540px", height: "540px", border: "1px solid rgba(45,212,191,0.15)" }} />
      <Ring style={{ bottom: "-340px", right: "-340px", width: "700px", height: "700px", border: "1px solid rgba(124,58,237,0.1)" }} />

      <div className="max-w-2xl mx-auto px-4 py-10 relative" style={{ zIndex: 1 }}>
        <div className="mb-8 text-center">
          <p className="text-teal-400 text-sm mb-2" style={{ ...displayFont }}>FIELD UNDERWRITING WORKSHEET</p>
          <h1
            className="text-4xl sm:text-5xl text-teal-400 font-bold mb-2"
            style={{ ...displayFont, textShadow: "4px 4px 0 rgba(124,58,237,0.55)" }}
          >
            Deal Calculator
          </h1>
          <p className="text-blue-300 text-lg" style={bodyFontLight}>ARV -&gt; Rehab -&gt; 70% Rule -&gt; Target Price</p>
        </div>

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
              <input type="checkbox" checked={arvOverride} onChange={(e) => setArvOverride(e.target.checked)} className="accent-teal-500" />
              Override ARV manually
            </label>
          </div>

          {arvOverride ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-blue-400 text-xl">$</span>
              <input type="number" value={arvManual} onChange={(e) => setArvManual(e.target.value)} placeholder="Manual ARV" className={inputClass} style={bodyFont} />
            </div>
          ) : (
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg text-blue-300" style={bodyFontLight}>
                Average of {compValues.length} comp{compValues.length !== 1 ? "s" : ""} = ARV
              </span>
              <span className="text-3xl font-bold text-teal-400" style={bodyFont}>{fmt(avgComp)}</span>
            </div>
          )}
        </section>

        <section className="mb-6 bg-blue-900 border-2 border-violet-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Hammer className="w-6 h-6 text-violet-400" strokeWidth={2.5} />
            <h2 className="text-2xl text-violet-400" style={displayFont}>Repair Estimate</h2>
          </div>
          <p className="text-blue-300 text-lg mb-4" style={bodyFontLight}>Rule-of-thumb rehab benchmark, based on photos and listing notes.</p>

          <div className="mb-4">
            <label className="text-lg text-blue-300 block mb-1" style={bodyFontLight}>Square footage</label>
            <input type="number" value={sqft} onChange={(e) => setSqft(e.target.value)} className={inputClass} style={bodyFont} />
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
            <input type="number" value={perSqft} onChange={(e) => setPerSqft(e.target.value)} className="w-28 bg-blue-950 border-2 border-blue-800 rounded-lg px-3 py-2 text-blue-50 text-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" style={bodyFont} />
          </div>

          <div className="pt-4 border-t border-blue-800">
            <label className="flex items-center gap-2 text-lg text-blue-300 cursor-pointer" style={bodyFontLight}>
              <input type="checkbox" checked={rehabOverride} onChange={(e) => setRehabOverride(e.target.checked)} className="accent-teal-500" />
              Override total manually
            </label>
          </div>

          {rehabOverride ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-blue-400 text-xl">$</span>
              <input type="number" value={rehabManual} onChange={(e) => setRehabManual(e.target.value)} placeholder="Manual rehab total" className={inputClass} style={bodyFont} />
            </div>
          ) : (
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg text-blue-300" style={bodyFontLight}>{sqftNum.toLocaleString()} sqft x {fmt(perSqftNum)}</span>
              <span className="text-3xl font-bold text-violet-400" style={bodyFont}>{fmt(rehabCalc)}</span>
            </div>
          )}
        </section>

        <section className="mb-6 bg-blue-900 border-2 border-teal-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-6 h-6 text-teal-400" strokeWidth={2.5} />
            <h2 className="text-2xl text-teal-400" style={displayFont}>Deal Terms</h2>
          </div>
          <p className="text-blue-300 text-lg mb-4" style={bodyFontLight}>MAO = (ARV x Rule%) - Rehab - Fee</p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-lg text-blue-300 block mb-1" style={bodyFontLight}>Rule %</label>
              <input type="number" value={rulePercent} onChange={(e) => setRulePercent(e.target.value)} className={inputClass} style={bodyFont} />
            </div>
            <div>
              <label className="text-lg text-blue-300 block mb-1" style={bodyFontLight}>Your fee ($)</label>
              <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className={inputClass} style={bodyFont} />
            </div>
          </div>

          <div>
            <label className="text-lg text-blue-300 block mb-1" style={bodyFontLight}>Listing price ($, optional)</label>
            <input type="number" value={listingPrice} onChange={(e) => setListingPrice(e.target.value)} placeholder="0" className={inputClass} style={bodyFont} />
          </div>
        </section>

        <section className="bg-blue-900 border-2 border-violet-700 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-violet-400" strokeWidth={2.5} />
            <h2 className="text-2xl text-violet-400" style={displayFont}>Deal Ledger</h2>
          </div>

          <div className="space-y-2 mb-5">
            <Row label="ARV (comps)" value={fmt(ARV)} />
            <Row label={ruleNum + "% of ARV"} value={fmt(ruleAmount)} />
            <Row label="- Rehab" value={"- " + fmt(rehabTotal)} muted />
            <Row label="= Buyer's Max Offer" value={fmt(buyerMAO)} bold />
            <Row label="- Your fee" value={"- " + fmt(feeNum)} muted />
            <div className="h-px bg-blue-800 my-2" />
          </div>

          <div className="flex justify-center py-6">
            <div
              className="rounded-full w-72 h-72 flex flex-col items-center justify-center gap-1 px-6"
              style={{
                border: "4px solid #14b8a6",
                boxShadow: "0 0 0 8px rgba(124,58,237,0.35)",
                backgroundColor: "rgba(2,6,23,0.65)",
              }}
            >
              <p className="text-center text-teal-400 text-xs" style={displayFont}>TARGET PRICE</p>
              <p
                className="text-center text-3xl sm:text-4xl font-bold"
                style={{
                  ...bodyFont,
                  background: "linear-gradient(90deg, #14b8a6, #7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {fmt(targetPrice)}
              </p>
              <p className="text-center text-blue-400 text-sm" style={bodyFontLight}>what you contract at</p>
            </div>
          </div>

          {hasListing && (
            <div className={"mt-4 flex items-start gap-2 p-4 rounded-lg border-2 " + (gap <= 0 ? "border-teal-700 text-teal-300" : "border-violet-700 text-violet-300")}>
              {gap <= 0 ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1 text-teal-400" strokeWidth={2.5} /> : <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1 text-violet-400" strokeWidth={2.5} />}
              <span className="text-lg" style={bodyFontLight}>
                {gap <= 0
                  ? "Listing price (" + fmt(listingNum) + ") is already " + fmt(Math.abs(gap)) + " below your target. Deal works at asking price."
                  : "You need the seller to come down " + fmt(gap) + " from the " + fmt(listingNum) + " listing to hit your target."}
              </span>
            </div>
          )}
        </section>

        <p className="text-blue-400 text-base text-center" style={bodyFontLight}>
          Rule-of-thumb estimates only - confirm with your buyer's numbers and the listing agent before contract.
        </p>
      </div>
    </div>
  );
}
