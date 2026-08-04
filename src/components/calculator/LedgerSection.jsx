import { useState } from "react";
import { Target, CheckCircle2, AlertTriangle, XCircle, Copy, Check } from "lucide-react";
import { fmt, dealSummaryText } from "../../lib/deal.js";
import { bodyFont, bodyFontLight, displayFont } from "../../lib/fonts.js";

function Row({ label, value, muted, bold }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={(muted ? "text-blue-400" : "text-blue-300") + " text-lg"} style={bodyFontLight}>{label}</span>
      <span className={(bold ? "text-teal-300 font-bold text-2xl" : muted ? "text-blue-400 text-lg" : "text-blue-100 text-lg")} style={bodyFont}>{value}</span>
    </div>
  );
}

export default function LedgerSection({ state, deal }) {
  const { ARV, ruleNum, ruleAmount, rehabTotal, buyerMAO, feeNum, targetPrice, dealWorks, listingNum, hasListing, gap } = deal;
  const [copied, setCopied] = useState(false);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(dealSummaryText(state, deal));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked (e.g. insecure context) — silently ignore
    }
  }

  return (
    <section className="bg-blue-900 border-2 border-violet-700 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-violet-400" strokeWidth={2.5} />
          <h2 className="text-2xl text-violet-400" style={displayFont}>Deal Ledger</h2>
        </div>
        <button
          onClick={copySummary}
          className="flex items-center gap-1 text-base text-teal-400 hover:text-teal-300"
          style={bodyFont}
        >
          {copied ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
          {copied ? "Copied!" : "Copy summary"}
        </button>
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
            border: dealWorks ? "4px solid #14b8a6" : "4px solid #f59e0b",
            boxShadow: dealWorks ? "0 0 0 8px rgba(124,58,237,0.35)" : "0 0 0 8px rgba(245,158,11,0.25)",
            backgroundColor: "rgba(2,6,23,0.65)",
          }}
        >
          <p className="text-center text-teal-400 text-xs" style={displayFont}>TARGET PRICE</p>
          {dealWorks ? (
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
          ) : (
            <p className="text-center text-2xl sm:text-3xl font-bold text-amber-400" style={bodyFont}>No deal</p>
          )}
          <p className="text-center text-blue-400 text-sm" style={bodyFontLight}>
            {dealWorks ? "what you contract at" : "rehab + fee exceed the rule"}
          </p>
        </div>
      </div>

      {!dealWorks && (
        <div className="mt-4 flex items-start gap-2 p-4 rounded-lg border-2 border-amber-600 text-amber-300">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-1 text-amber-400" strokeWidth={2.5} />
          <span className="text-lg" style={bodyFontLight}>
            At these numbers the rehab and your fee eat up the entire 70% margin — there's no room left to contract. Lower the rehab, drop your fee, or raise the ARV.
          </span>
        </div>
      )}

      {dealWorks && hasListing && (
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
  );
}
