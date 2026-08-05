import { describe, it, expect } from "vitest";
import {
  emptyBuyer,
  buildBuyBoxSummary,
  buildBuyBoxText,
  mailtoHref,
  telHref,
  smsHref,
  firstName,
  displayName,
} from "./buyers.js";

function sample(over = {}) {
  return {
    ...emptyBuyer(),
    investorName: "Dana Reyes",
    companyName: "Reyes Capital",
    email: "dana@reyescap.com",
    phone: "(614) 555-2020",
    targetCityState: "Columbus, OH",
    neighborhoodsZips: "43201, 43202",
    areasToAvoid: "Franklinton",
    assetTypes: ["Single Family", "Duplex/Triplex"],
    minBeds: "3",
    minBaths: "2",
    minSqft: "1000",
    strategies: ["Fix & Flip"],
    arv: "210000",
    maxPurchase: "140000",
    maxRehab: "45000",
    dealBreakers: ["Foundation Issues"],
    ...over,
  };
}

describe("name helpers", () => {
  it("pulls the first name", () => {
    expect(firstName(sample())).toBe("Dana");
    expect(firstName(emptyBuyer())).toBe("there");
  });
  it("falls back company -> placeholder for display name", () => {
    expect(displayName(sample())).toBe("Dana Reyes");
    expect(displayName({ ...emptyBuyer(), companyName: "Reyes Capital" })).toBe("Reyes Capital");
    expect(displayName(emptyBuyer())).toBe("Unnamed buyer");
  });
});

describe("buildBuyBoxSummary", () => {
  it("produces brief, Zillow-ready rows and drops empties", () => {
    const rows = buildBuyBoxSummary(sample());
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.value]));
    expect(byLabel.Where).toBe("Columbus, OH · 43201, 43202");
    expect(byLabel.What).toContain("Single Family / Duplex/Triplex");
    expect(byLabel.What).toContain("3+ bd");
    expect(byLabel.What).toContain("1,000+ sqft");
    expect(byLabel.Numbers).toContain("Max buy $140,000");
    expect(byLabel.Numbers).toContain("ARV $210,000");
    expect(byLabel.Strategy).toBe("Fix & Flip");
    expect(byLabel.Avoid).toContain("Franklinton");
    expect(byLabel.Avoid).toContain("Foundation Issues");
  });

  it("omits rows with no data", () => {
    const rows = buildBuyBoxSummary(emptyBuyer());
    expect(rows).toHaveLength(0);
  });
});

describe("buildBuyBoxText", () => {
  it("joins rows into label: value lines", () => {
    const text = buildBuyBoxText(sample());
    expect(text).toContain("Where: Columbus, OH");
    expect(text.split("\n").length).toBeGreaterThanOrEqual(4);
  });
});

describe("contact links", () => {
  it("builds a mailto with subject and buy-box body", () => {
    const href = mailtoHref(sample());
    expect(href.startsWith("mailto:dana@reyescap.com?")).toBe(true);
    expect(decodeURIComponent(href)).toContain("Investment properties in Columbus, OH");
    expect(decodeURIComponent(href)).toContain("Hi Dana,");
    expect(decodeURIComponent(href)).toContain("Max buy $140,000");
  });

  it("returns null mailto when no email", () => {
    expect(mailtoHref({ ...sample(), email: "" })).toBe(null);
  });

  it("builds tel/sms from digits only", () => {
    expect(telHref(sample())).toBe("tel:6145552020");
    expect(smsHref(sample())).toBe("sms:6145552020");
    expect(telHref({ ...sample(), phone: "" })).toBe(null);
  });
});
