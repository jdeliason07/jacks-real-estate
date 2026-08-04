// Pure deal math + formatting. No React, no DOM — safe to unit test.

export const REHAB_TIERS = {
  light: { label: "Light Cosmetic", range: "$15-$25 / sqft", min: 15, max: 25, desc: "Paint, flooring, light fixtures, landscape cleanup" },
  moderate: { label: "Moderate Rehab", range: "$30-$50 / sqft", min: 30, max: 50, desc: "Kitchen & bath update, appliances, minor systems/roof" },
  heavy: { label: "Heavy / Full Gut", range: "$60-$90+ / sqft", min: 60, max: 90, desc: "Mechanicals, structural, new roof, frame-up" },
};

export function fmt(n) {
  if (!isFinite(n)) return "$0";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/**
 * Compute every derived number for a deal from the raw input state.
 * Single source of truth so overrides can never desync from the ledger.
 *
 * Returns, among others:
 *   ARV, rehabTotal, ruleAmount, buyerMAO   — resolved values (respect overrides)
 *   rawTarget                               — target before clamping (can be negative)
 *   targetPrice                             — rawTarget clamped at 0
 *   dealWorks                               — false when the math yields <= 0
 *   arvMissing / rehabMissing               — override checked but no value entered
 */
export function computeDeal(state) {
  const {
    comps = [],
    arvOverride = false,
    arvManual = "",
    sqft = "",
    perSqft = "",
    rehabOverride = false,
    rehabManual = "",
    rulePercent = "",
    fee = "",
    listingPrice = "",
  } = state || {};

  const compValues = comps
    .map((c) => parseFloat(c.price))
    .filter((n) => !isNaN(n) && n > 0);
  const avgComp = compValues.length ? compValues.reduce((a, b) => a + b, 0) / compValues.length : 0;
  const ARV = arvOverride ? parseFloat(arvManual) || 0 : avgComp;
  const arvMissing = arvOverride && !(parseFloat(arvManual) > 0);

  const sqftNum = parseFloat(sqft) || 0;
  const perSqftNum = parseFloat(perSqft) || 0;
  const rehabCalc = sqftNum * perSqftNum;
  const rehabTotal = rehabOverride ? parseFloat(rehabManual) || 0 : rehabCalc;
  const rehabMissing = rehabOverride && !(parseFloat(rehabManual) > 0);

  const ruleNum = parseFloat(rulePercent) || 0;
  const feeNum = parseFloat(fee) || 0;
  const ruleAmount = ARV * (ruleNum / 100);
  const buyerMAO = ruleAmount - rehabTotal;
  const rawTarget = buyerMAO - feeNum;
  const dealWorks = rawTarget > 0;
  const targetPrice = Math.max(0, rawTarget);

  const listingNum = parseFloat(listingPrice) || 0;
  const hasListing = listingPrice !== "" && listingNum > 0;
  const gap = listingNum - targetPrice;

  return {
    compValues,
    avgComp,
    ARV,
    arvMissing,
    sqftNum,
    perSqftNum,
    rehabCalc,
    rehabTotal,
    rehabMissing,
    ruleNum,
    feeNum,
    ruleAmount,
    buyerMAO,
    rawTarget,
    targetPrice,
    dealWorks,
    listingNum,
    hasListing,
    gap,
  };
}

/** Build a plain-text deal summary suitable for copy/paste. */
export function dealSummaryText(state, d = computeDeal(state)) {
  const lines = [
    "Jack's Realty — Deal Summary",
    "",
    `ARV: ${fmt(d.ARV)}`,
    `${d.ruleNum}% of ARV: ${fmt(d.ruleAmount)}`,
    `Rehab: -${fmt(d.rehabTotal)}`,
    `Buyer's Max Offer: ${fmt(d.buyerMAO)}`,
    `Your fee: -${fmt(d.feeNum)}`,
    `Target contract price: ${d.dealWorks ? fmt(d.targetPrice) : "$0 (deal does not work)"}`,
  ];
  if (d.hasListing) {
    lines.push("");
    lines.push(
      d.gap <= 0
        ? `Listing ${fmt(d.listingNum)} — works at asking (${fmt(Math.abs(d.gap))} of room).`
        : `Listing ${fmt(d.listingNum)} — need seller to come down ${fmt(d.gap)}.`
    );
  }
  return lines.join("\n");
}
