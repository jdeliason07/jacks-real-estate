// Pipeline deal records — the properties being sourced, underwritten, and
// carried through to close. Pure schema + mappers, no storage and no React,
// so it's all unit-testable. Persistence lives in repo.js.
//
// Not to be confused with `emptyDeal()` in buyers.js: that one is a line in a
// buyer's closed-deal history ("we did 123 Main together, $8k fee"). This is
// the live pipeline record the dashboard is built on.

import { computeDeal, fmt } from "./deal.js";

/** fmt() but blank-tolerant — an unfilled field reads as "—", not "$0". */
export function money(v) {
  const n = parseFloat(v);
  return isFinite(n) ? fmt(n) : "—";
}

// ---- Vocabularies ---------------------------------------------------------

export const STAGES = ["prospective", "live", "closed_won", "closed_dead"];

/** Where a prospective deal sits in the sourcing conversation. */
export const PROSPECT_STATUSES = [
  "Researching",
  "Contacted Agent",
  "Offer Made",
  "Under Negotiation",
  "Dead",
];

/** How committed a buyer is to a given deal. */
export const BUYER_STATUSES = ["interested", "assigned", "passed"];

// ---- Record factory -------------------------------------------------------

export function emptyDeal() {
  return {
    id: null,
    createdAt: null,
    updatedAt: null,

    // Identity
    address: "",
    stage: "prospective",
    status: "Researching", // only meaningful while stage === "prospective"

    // Underwriting — mirrors the Deal Calculator's inputs one-for-one.
    listingPrice: "",
    comps: [{ id: 1, price: "" }],
    arvOverride: false,
    arv: "", // manual ARV; ignored unless arvOverride
    sqft: "",
    rehabTier: "moderate",
    rehabPerSqft: "35",
    rehabOverride: false,
    rehabTotal: "", // manual rehab; ignored unless rehabOverride
    rulePercent: "70",
    assignmentFee: "5000",

    // Live-deal fields — empty until the PA is signed.
    contractPrice: "",
    paSignedDate: "",
    ddEndDate: "",
    projectedCloseDate: "",
    sellerName: "", // whoever's on the other side of the PA; used by the notice

    notes: "",
  };
}

/**
 * Fill in anything a stored record is missing so partial, hand-edited, or
 * imported data can never crash the UI. Always run on read — same contract as
 * normalizeBuyer().
 */
export function normalizeDeal(raw) {
  const d = { ...emptyDeal(), ...(raw || {}) };

  if (!STAGES.includes(d.stage)) d.stage = "prospective";
  if (!PROSPECT_STATUSES.includes(d.status)) d.status = "Researching";

  // Comps must always be a non-empty array of {id, price}: the calculator
  // renders one row per entry and can't cope with holes.
  if (!Array.isArray(d.comps)) d.comps = [];
  d.comps = d.comps
    .filter(Boolean)
    .map((c, i) => ({ id: Number.isFinite(c.id) ? c.id : i + 1, price: c.price == null ? "" : String(c.price) }));
  if (!d.comps.length) d.comps = [{ id: 1, price: "" }];

  d.arvOverride = Boolean(d.arvOverride);
  d.rehabOverride = Boolean(d.rehabOverride);

  // Numeric inputs are held as strings (the calculator parses at compute time).
  for (const f of ["listingPrice", "arv", "sqft", "rehabPerSqft", "rehabTotal", "rulePercent", "assignmentFee", "contractPrice"]) {
    if (d[f] == null) d[f] = "";
    else if (typeof d[f] === "number") d[f] = String(d[f]);
  }

  return d;
}

// ---- Calculator bridge ----------------------------------------------------

/**
 * Deal record → Deal Calculator state. Keeps the two shapes decoupled so the
 * calculator can rename a field without a data migration.
 */
export function calcStateFromDeal(deal) {
  const d = normalizeDeal(deal);
  return {
    comps: d.comps,
    arvOverride: d.arvOverride,
    arvManual: d.arv,
    sqft: d.sqft,
    tier: d.rehabTier,
    perSqft: d.rehabPerSqft,
    rehabOverride: d.rehabOverride,
    rehabManual: d.rehabTotal,
    rulePercent: d.rulePercent,
    fee: d.assignmentFee,
    listingPrice: d.listingPrice,
  };
}

/** Deal Calculator state → the deal fields it owns. Inverse of the above. */
export function dealPatchFromCalcState(state) {
  const s = state || {};
  return {
    comps: Array.isArray(s.comps) ? s.comps : [],
    arvOverride: Boolean(s.arvOverride),
    arv: s.arvManual ?? "",
    sqft: s.sqft ?? "",
    rehabTier: s.tier ?? "moderate",
    rehabPerSqft: s.perSqft ?? "",
    rehabOverride: Boolean(s.rehabOverride),
    rehabTotal: s.rehabManual ?? "",
    rulePercent: s.rulePercent ?? "",
    assignmentFee: s.fee ?? "",
    listingPrice: s.listingPrice ?? "",
  };
}

/**
 * Run the deal through the existing calculator math. Derived on demand rather
 * than stored, so an edited comp can never leave a stale target price behind —
 * the same single-source-of-truth rule computeDeal() already enforces.
 */
export function dealMath(deal) {
  return computeDeal(calcStateFromDeal(deal));
}

// ---- Stage helpers --------------------------------------------------------

export const isProspective = (d) => d.stage === "prospective";
export const isLive = (d) => d.stage === "live";

/**
 * Fields the "Move to Live" step collects. Underwriting is untouched by design:
 * promoting a deal must never cost you the numbers you already worked out.
 */
export function liveFieldsFrom(deal) {
  const d = normalizeDeal(deal);
  const math = dealMath(d);
  return {
    // Default the contract price to what the underwriting says you can pay.
    contractPrice: d.contractPrice || (math.dealWorks ? String(Math.round(math.targetPrice)) : ""),
    assignmentFee: d.assignmentFee,
    paSignedDate: d.paSignedDate || todayISO(),
    ddEndDate: d.ddEndDate,
    projectedCloseDate: d.projectedCloseDate,
  };
}

/** Local calendar date as YYYY-MM-DD (not UTC — see countdown.js). */
export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "123 Main St" or a stable fallback, for headings and the notice template. */
export function dealLabel(deal) {
  return (deal?.address || "").trim() || "Untitled deal";
}
