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
    updatedAt: null,
    lastContactedAt: null,
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

const ARRAY_FIELDS = ["assetTypes", "strategies", "rehabScope", "dealBreakers", "fundingType", "deals"];

/**
 * Fill in anything a stored record is missing so partial, hand-edited, or
 * imported data can never crash the UI. Always run on read.
 */
export function normalizeBuyer(raw) {
  const b = { ...emptyBuyer(), ...(raw || {}) };
  for (const f of ARRAY_FIELDS) if (!Array.isArray(b[f])) b[f] = [];
  b.deals = b.deals.filter(Boolean).map((d) => ({ ...emptyDeal(), ...d }));
  return b;
}

// ---- Formatting helpers --------------------------------------------------

function money(v) {
  const n = parseFloat(v);
  return isFinite(n) ? fmt(n) : "";
}

const num = (v) => {
  const n = parseFloat(v);
  return isFinite(n) ? n : null;
};

export function firstName(b) {
  return (b.investorName || "").trim().split(/\s+/)[0] || "there";
}

export function displayName(b) {
  return (b.investorName || "").trim() || (b.companyName || "").trim() || "Unnamed buyer";
}

/** Whole days since an ISO timestamp, or null if never/invalid. */
export function daysSince(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!isFinite(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

/** "today" / "3d ago" / "2mo ago" — compact enough for a card badge. */
export function relativeDays(iso) {
  const d = daysSince(iso);
  if (d === null) return "never";
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

/**
 * Brief buy-box summary as {label, value} rows — just enough to jump onto
 * Zillow and find matching properties. Empty rows are dropped.
 */
export function buildBuyBoxSummary(raw) {
  const b = normalizeBuyer(raw);
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

  const avoid = [b.areasToAvoid, ...b.dealBreakers].filter(Boolean).join(" · ");
  if (avoid) rows.push({ label: "Avoid", value: avoid });

  return rows;
}

/** Plain-text buy box for copy/paste (email body, Zillow search prep). */
export function buildBuyBoxText(b) {
  return buildBuyBoxSummary(b)
    .map((r) => `${r.label}: ${r.value}`)
    .join("\n");
}

// ---- Zillow ---------------------------------------------------------------

/**
 * Best-effort Zillow search URL from the buy box — the intake form's whole
 * purpose. Zillow's path filters are tolerant: unknown segments are ignored,
 * so a partial buy box still lands on the right search.
 */
export function zillowSearchUrl(raw) {
  const b = normalizeBuyer(raw);
  const city = (b.targetCityState || "").trim();
  const firstZip = (b.neighborhoodsZips || "").match(/\b\d{5}\b/);
  const place = city
    ? city.replace(/,/g, "").trim().replace(/\s+/g, "-")
    : firstZip
      ? firstZip[0]
      : null;
  if (!place) return null;

  const parts = [];
  const beds = num(b.minBeds);
  const baths = num(b.minBaths);
  const sqft = num(b.minSqft);
  const maxPrice = num(b.maxPurchase);
  if (beds) parts.push(`${beds}-_beds`);
  if (baths) parts.push(`${baths}-_baths`);
  if (maxPrice) parts.push(`0-${Math.round(maxPrice)}_price`);
  if (sqft) parts.push(`${Math.round(sqft)}-_size`);

  return `https://www.zillow.com/homes/for_sale/${encodeURIComponent(place)}/${parts.join("/")}${parts.length ? "/" : ""}`;
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

// ---- Deal matching --------------------------------------------------------

/**
 * Does a computed deal fit this buyer? Compares the price the buyer would pay
 * (the buyer's max offer from the calculator) against their max purchase, and
 * the rehab against their budget. Missing criteria are treated as "no limit",
 * so a sparse record still surfaces rather than silently dropping out.
 */
export function buyerFitsDeal(raw, { buyerMAO, rehabTotal, ARV }) {
  const b = normalizeBuyer(raw);
  const maxBuy = num(b.maxPurchase);
  const maxRehab = num(b.maxRehab);
  const targetArv = num(b.arv);

  if (maxBuy !== null && isFinite(buyerMAO) && buyerMAO > maxBuy) return false;
  if (maxRehab !== null && isFinite(rehabTotal) && rehabTotal > maxRehab) return false;
  // ARV is a target, not a ceiling — only rule out wildly-below deals.
  if (targetArv !== null && isFinite(ARV) && ARV > 0 && ARV < targetArv * 0.6) return false;
  return true;
}

export function matchingBuyers(list, deal) {
  if (!deal || !isFinite(deal.buyerMAO) || deal.buyerMAO <= 0) return [];
  return list.filter((b) => buyerFitsDeal(b, deal));
}

// ---- Sorting --------------------------------------------------------------

export const SORTS = {
  recent: {
    label: "Newest",
    fn: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  },
  followUp: {
    label: "Follow up",
    // Never-contacted first, then longest since contact.
    fn: (a, b) => {
      const av = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : -Infinity;
      const bv = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : -Infinity;
      return av - bv;
    },
  },
  name: {
    label: "A–Z",
    fn: (a, b) => displayName(a).localeCompare(displayName(b)),
  },
};

export function sortBuyers(list, key) {
  const s = SORTS[key] || SORTS.recent;
  return [...list].sort(s.fn);
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
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeBuyer) : [];
  } catch {
    return [];
  }
}

function writeBuyers(list) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    // Quota exceeded or storage unavailable — surface to the caller so the UI
    // can warn instead of silently losing the record.
    return false;
  }
}

export function getBuyer(id) {
  return getBuyers().find((b) => b.id === id) || null;
}

/** Insert (no id) or update (existing id). Returns the saved buyer. */
export function saveBuyer(buyer) {
  const list = getBuyers();
  const now = new Date().toISOString();
  let saved;
  if (buyer.id) {
    saved = normalizeBuyer({ ...buyer, updatedAt: now });
    const i = list.findIndex((b) => b.id === buyer.id);
    if (i >= 0) list[i] = saved;
    else list.push(saved);
  } else {
    saved = normalizeBuyer({ ...buyer, id: uid(), createdAt: now, updatedAt: now });
    list.push(saved);
  }
  writeBuyers(list);
  return saved;
}

export function removeBuyer(id) {
  writeBuyers(getBuyers().filter((b) => b.id !== id));
}

/** Stamp a buyer as contacted — called when you tap email/call/text. */
export function markContacted(id, when = new Date().toISOString()) {
  const list = getBuyers();
  const b = list.find((x) => x.id === id);
  if (!b) return null;
  b.lastContactedAt = when;
  writeBuyers(list);
  return b;
}

export function addDeal(buyerId, deal) {
  const list = getBuyers();
  const b = list.find((x) => x.id === buyerId);
  if (!b) return null;
  b.deals.unshift({ ...emptyDeal(), ...deal, id: uid() });
  b.updatedAt = new Date().toISOString();
  writeBuyers(list);
  return b;
}

export function removeDeal(buyerId, dealId) {
  const list = getBuyers();
  const b = list.find((x) => x.id === buyerId);
  if (!b) return null;
  b.deals = b.deals.filter((d) => d.id !== dealId);
  writeBuyers(list);
  return b;
}

/** Newest first, with undated deals last. */
export function sortedDeals(b) {
  return [...normalizeBuyer(b).deals].sort((x, y) => {
    if (!x.date && !y.date) return 0;
    if (!x.date) return 1;
    if (!y.date) return -1;
    return new Date(y.date) - new Date(x.date);
  });
}

// ---- Backup ---------------------------------------------------------------

export const BACKUP_VERSION = 1;

export function buildBackup(list = getBuyers()) {
  return JSON.stringify(
    { app: "jacks-realty", type: "buyers-backup", version: BACKUP_VERSION, exportedAt: new Date().toISOString(), buyers: list },
    null,
    2
  );
}

/**
 * Parse a backup file. Accepts either the wrapped export format or a bare
 * array of buyers. Returns {buyers} or throws with a readable message.
 */
export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const list = Array.isArray(data) ? data : data && data.buyers;
  if (!Array.isArray(list)) throw new Error("No buyers found in that file.");
  return { buyers: list.map(normalizeBuyer) };
}

/**
 * Merge imported buyers into storage. Records with a matching id replace the
 * local copy; everything else is appended with a fresh id.
 */
export function importBuyers(incoming) {
  const list = getBuyers();
  let added = 0;
  let updated = 0;
  for (const raw of incoming) {
    const b = normalizeBuyer(raw);
    const i = b.id ? list.findIndex((x) => x.id === b.id) : -1;
    if (i >= 0) {
      list[i] = b;
      updated++;
    } else {
      list.push({ ...b, id: b.id || uid(), createdAt: b.createdAt || new Date().toISOString() });
      added++;
    }
  }
  writeBuyers(list);
  return { added, updated };
}
