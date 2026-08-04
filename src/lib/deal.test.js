import { describe, it, expect } from "vitest";
import { computeDeal, dealSummaryText } from "./deal.js";

const base = {
  comps: [{ id: 1, price: "210000" }, { id: 2, price: "215000" }, { id: 3, price: "205000" }],
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

describe("computeDeal", () => {
  it("averages the comps into ARV", () => {
    const d = computeDeal(base);
    expect(d.avgComp).toBe(210000); // (210k + 215k + 205k) / 3
    expect(d.ARV).toBe(210000);
  });

  it("ignores blank / non-positive comps when averaging", () => {
    const d = computeDeal({ ...base, comps: [{ id: 1, price: "200000" }, { id: 2, price: "" }, { id: 3, price: "0" }] });
    expect(d.compValues).toHaveLength(1);
    expect(d.ARV).toBe(200000);
  });

  it("uses the manual ARV when overridden", () => {
    const d = computeDeal({ ...base, arvOverride: true, arvManual: "300000" });
    expect(d.ARV).toBe(300000);
    expect(d.arvMissing).toBe(false);
  });

  it("flags a missing manual ARV", () => {
    const d = computeDeal({ ...base, arvOverride: true, arvManual: "" });
    expect(d.ARV).toBe(0);
    expect(d.arvMissing).toBe(true);
  });

  it("computes rehab from sqft x $/sqft", () => {
    const d = computeDeal(base);
    expect(d.rehabTotal).toBe(1200 * 35); // 42000
  });

  it("uses the manual rehab total when overridden", () => {
    const d = computeDeal({ ...base, rehabOverride: true, rehabManual: "60000" });
    expect(d.rehabTotal).toBe(60000);
  });

  it("computes the full MAO chain", () => {
    const d = computeDeal(base);
    // 210000 * 0.70 = 147000; - 42000 rehab = 105000; - 5000 fee = 100000
    expect(d.ruleAmount).toBe(147000);
    expect(d.buyerMAO).toBe(105000);
    expect(d.rawTarget).toBe(100000);
    expect(d.targetPrice).toBe(100000);
    expect(d.dealWorks).toBe(true);
  });

  it("clamps a negative target to 0 and marks the deal as not working", () => {
    const d = computeDeal({ ...base, rehabOverride: true, rehabManual: "200000" });
    expect(d.rawTarget).toBeLessThan(0);
    expect(d.targetPrice).toBe(0);
    expect(d.dealWorks).toBe(false);
  });

  it("computes the listing gap", () => {
    const d = computeDeal(base); // target 100000, listing 80000
    expect(d.hasListing).toBe(true);
    expect(d.gap).toBe(-20000); // listing is below target -> works at asking
  });

  it("treats an empty listing price as no listing", () => {
    const d = computeDeal({ ...base, listingPrice: "" });
    expect(d.hasListing).toBe(false);
  });
});

describe("dealSummaryText", () => {
  it("includes the target price and listing line", () => {
    const text = dealSummaryText(base);
    expect(text).toContain("Target contract price: $100,000");
    expect(text).toContain("works at asking");
  });

  it("reports a non-working deal", () => {
    const text = dealSummaryText({ ...base, rehabOverride: true, rehabManual: "200000" });
    expect(text).toContain("deal does not work");
  });
});
