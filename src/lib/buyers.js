// Buyer (cash-buyer) records + buy-box helpers. Field set mirrors the
// "Real Estate Cash Buyer Intake Form" PDF. Pure helpers here are unit-tested;
// the localStorage CRUD is a thin wrapper used by the pages.

import { fmt } from "./deal.js";

// ---- Option sets (match the intake form) --------------------------------

export const MONTHLY_VOLUME = ["1–2 deals", "3–5 deals", "5+ deals"];
export const ASSET_TYPES = ["Single Family", "Duplex/Triplex", "Small Multi-Family"];
export const STRATEGIES = ["Fix & Flip", "Buy & Hold (Rental)", "BRRRR"];
export const DISCOUNT_RULES = ["70% ARV minus Rehab", "75% ARV minus Rehab", "Custom"];
export const REHAB_SCOPE = ["Cosmetic Only", "Moderate", "Heavy / Full Gut"];
export const DEAL_BREAKERS = [
  "Foundation Issues",
  "Knob & Tube Wiring",
  "Busy Main Streets",
  "POS Escrow Liens > $20k",
  "Environmental / Mold",
];
export const FUNDING_TYPES = ["Cash", "Hard Money", "Private Money Line"];
export const POF_STATUS = ["Ready on Demand", "Need 24-48 Hours"];
export const CLOSING_TIMELINE = ["7–10 Days", "14–21 Days", "30 Days"];
export const DEAL_STATUS = ["Closed", "Under Contract", "Dead"];

// ---- Record factories ----------------------------------------------------

export function emptyBuyer() {
  return {
    id: null,
    createdAt: null,
    // 1. Investor & entity
    investorName: "",
    companyName: "",
    email: "",
    phone: "",
    social: "",
    monthlyVolume: "",
    // 2. Target market
    targetCityState: "",
    neighborhoodsZips: "",
    areasToAvoid: "",
    // 3. Property criteria
    assetTypes: [],
    minBeds: "",
    minBaths: "",
    minSqft: "",
    strategies: [],
    // 4. Financial & underwriting
    arv: "",
    maxPurchase: "",
    maxRehab: "",
    discountRule: "",
    discountCustom: "",
    finderFee: "",
    // 5. Condition & scope
    rehabScope: [],
    dealBreakers: [],
    // 6. Transaction & closing
    fundingType: [],
    pofStatus: "",
    closingTimeline: "",
    // extras
    notes: "",
    deals: [],
  };
}

export function emptyDeal() {
  return { id: null, date: "", address: "", propertyType: "", price: "", fee: "", status: "Closed", notes: "" };
}

// ---- Formatting helpers --------------------------------------------------

function money(v) {
  const n = parseFloat(v);
  return isFinite(n) ? fmt(n) : "";
}

export function firstName(b) {
  return (b.investorName || "").trim().split(/\s+/)[0] || "there";
}

export function displayName(b) {
  return (b.investorName || "").trim() || (b.companyName || "").trim() || "Unnamed buyer";
}

/**
 * Brief buy-box summary as {label, value} rows — just enough to jump onto
 * Zillow and find matching properties. Empty rows are dropped.
 */
export function buildBuyBoxSummary(b) {
  const rows = [];
  const loc = [b.targetCityState, b.neighborhoodsZips].filter(Boolean).join(" · ");
  if (loc) rows.push({ label: "Where", value: loc });

  const typeBits = [];
  if (b.assetTypes.length) typeBits.push(b.assetTypes.join(" / "));
  const bb = [];
  if (b.minBeds) bb.push(`${b.minBeds}+ bd`);
  if (b.minBaths) bb.push(`${b.minBaths}+ ba`);
  if (b.minSqft) bb.push(`${Number(b.minSqft).toLocaleString()}+ sqft`);
  if (bb.length) typeBits.push(bb.join(" / "));
  if (typeBits.length) rows.push({ label: "What", value: typeBits.join(" · ") });

  const nums = [];
  if (b.maxPurchase) nums.push(`Max buy ${money(b.maxPurchase)}`);
  if (b.arv) nums.push(`ARV ${money(b.arv)}`);
  if (b.maxRehab) nums.push(`Rehab ≤ ${money(b.maxRehab)}`);
  if (nums.length) rows.push({ label: "Numbers", value: nums.join(" · ") });

  if (b.strategies.length) rows.push({ label: "Strategy", value: b.strategies.join(", ") });

  const avoid = [b.areasToAvoid, ...(b.dealBreakers || [])].filter(Boolean).join(" · ");
  if (avoid) rows.push({ label: "Avoid", value: avoid });

  return rows;
}

/** Plain-text buy box for copy/paste (email body, Zillow search prep). */
export function buildBuyBoxText(b) {
  return buildBuyBoxSummary(b)
    .map((r) => `${r.label}: ${r.value}`)
    .join("\n");
}

// ---- Contact link builders ----------------------------------------------

export function telHref(b) {
  const digits = (b.phone || "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

export function smsHref(b) {
  const digits = (b.phone || "").replace(/[^\d+]/g, "");
  return digits ? `sms:${digits}` : null;
}

export function mailtoHref(b) {
  if (!b.email) return null;
  const subject = `Investment properties${b.targetCityState ? ` in ${b.targetCityState}` : ""}`;
  const buyBox = buildBuyBoxText(b);
  const body =
    `Hi ${firstName(b)},\n\n` +
    `I may have a property that fits your buy box${b.targetCityState ? ` in ${b.targetCityState}` : ""}. ` +
    `Quick recap of what you're after:\n\n` +
    (buyBox || "(buy box on file)") +
    `\n\nLet me know if you'd like the numbers and photos.\n\nThanks,\nJack`;
  return `mailto:${b.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ---- localStorage CRUD ---------------------------------------------------

const KEY = "jacks-realty-buyers-v1";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getBuyers() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeBuyers(list) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage unavailable — non-fatal
  }
}

export function getBuyer(id) {
  return getBuyers().find((b) => b.id === id) || null;
}

/** Insert (no id) or update (existing id). Returns the saved buyer. */
export function saveBuyer(buyer) {
  const list = getBuyers();
  let saved;
  if (buyer.id) {
    saved = { ...buyer };
    const i = list.findIndex((b) => b.id === buyer.id);
    if (i >= 0) list[i] = saved;
    else list.push(saved);
  } else {
    saved = { ...buyer, id: uid(), createdAt: new Date().toISOString() };
    list.push(saved);
  }
  writeBuyers(list);
  return saved;
}

export function removeBuyer(id) {
  writeBuyers(getBuyers().filter((b) => b.id !== id));
}

export function addDeal(buyerId, deal) {
  const list = getBuyers();
  const b = list.find((x) => x.id === buyerId);
  if (!b) return null;
  b.deals = b.deals || [];
  b.deals.unshift({ ...deal, id: uid() });
  writeBuyers(list);
  return b;
}

export function removeDeal(buyerId, dealId) {
  const list = getBuyers();
  const b = list.find((x) => x.id === buyerId);
  if (!b) return null;
  b.deals = (b.deals || []).filter((d) => d.id !== dealId);
  writeBuyers(list);
  return b;
}
