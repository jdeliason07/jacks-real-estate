import { describe, it, expect } from "vitest";
import {
  normalizeBuyer,
  buildBuyBoxSummary,
  zillowSearchUrl,
  buyerFitsDeal,
  matchingBuyers,
  sortBuyers,
  relativeDays,
  daysSince,
  sortedDeals,
  buildBackup,
  parseBackup,
  emptyBuyer,
} from "./buyers.js";

describe("normalizeBuyer", () => {
  it("fills missing array fields so partial records can't crash", () => {
    const b = normalizeBuyer({ investorName: "X" });
    expect(b.assetTypes).toEqual([]);
    expect(b.strategies).toEqual([]);
    expect(b.dealBreakers).toEqual([]);
    expect(b.deals).toEqual([]);
  });

  it("repairs fields holding the wrong type", () => {
    const b = normalizeBuyer({ assetTypes: "Single Family", deals: null });
    expect(Array.isArray(b.assetTypes)).toBe(true);
    expect(b.deals).toEqual([]);
  });

  it("handles null/undefined input", () => {
    expect(normalizeBuyer(null).investorName).toBe("");
    expect(normalizeBuyer(undefined).deals).toEqual([]);
  });

  it("lets buildBuyBoxSummary survive a partial record (regression)", () => {
    expect(() => buildBuyBoxSummary({ investorName: "X", targetCityState: "Columbus, OH" })).not.toThrow();
    const rows = buildBuyBoxSummary({ targetCityState: "Columbus, OH" });
    expect(rows[0]).toEqual({ label: "Where", value: "Columbus, OH" });
  });
});

describe("zillowSearchUrl", () => {
  it("builds a city search with beds, baths and max price", () => {
    const url = zillowSearchUrl({ ...emptyBuyer(), targetCityState: "Columbus, OH", minBeds: "3", minBaths: "2", maxPurchase: "140000" });
    expect(url).toContain("zillow.com/homes/for_sale/Columbus-OH/");
    expect(url).toContain("3-_beds");
    expect(url).toContain("2-_baths");
    expect(url).toContain("0-140000_price");
  });

  it("falls back to the first zip when no city is set", () => {
    const url = zillowSearchUrl({ ...emptyBuyer(), neighborhoodsZips: "43201, 43202" });
    expect(url).toContain("/for_sale/43201/");
  });

  it("returns null with no location at all", () => {
    expect(zillowSearchUrl(emptyBuyer())).toBe(null);
  });
});

describe("buyerFitsDeal", () => {
  const buyer = { ...emptyBuyer(), maxPurchase: "140000", maxRehab: "50000", arv: "200000" };
  const deal = { buyerMAO: 120000, rehabTotal: 40000, ARV: 210000 };

  it("accepts a deal inside the buy box", () => {
    expect(buyerFitsDeal(buyer, deal)).toBe(true);
  });

  it("rejects an offer above their max purchase", () => {
    expect(buyerFitsDeal(buyer, { ...deal, buyerMAO: 150000 })).toBe(false);
  });

  it("rejects rehab over their budget", () => {
    expect(buyerFitsDeal(buyer, { ...deal, rehabTotal: 80000 })).toBe(false);
  });

  it("treats missing criteria as no limit", () => {
    expect(buyerFitsDeal(emptyBuyer(), deal)).toBe(true);
  });

  it("returns no matches for a deal that doesn't work", () => {
    expect(matchingBuyers([buyer], { buyerMAO: 0, rehabTotal: 0, ARV: 0 })).toEqual([]);
  });

  it("filters a list down to fitting buyers", () => {
    const tight = { ...emptyBuyer(), id: "t", maxPurchase: "50000" };
    const matches = matchingBuyers([{ ...buyer, id: "a" }, tight], deal);
    expect(matches.map((m) => m.id)).toEqual(["a"]);
  });
});

describe("sorting", () => {
  const a = { ...emptyBuyer(), id: "a", investorName: "Zoe", createdAt: "2026-01-01", lastContactedAt: "2026-07-01" };
  const b = { ...emptyBuyer(), id: "b", investorName: "Adam", createdAt: "2026-06-01", lastContactedAt: null };

  it("sorts newest first", () => {
    expect(sortBuyers([a, b], "recent").map((x) => x.id)).toEqual(["b", "a"]);
  });

  it("puts never-contacted first for follow-up", () => {
    expect(sortBuyers([a, b], "followUp").map((x) => x.id)).toEqual(["b", "a"]);
  });

  it("sorts alphabetically", () => {
    expect(sortBuyers([a, b], "name").map((x) => x.id)).toEqual(["b", "a"]);
  });

  it("does not mutate the input", () => {
    const list = [a, b];
    sortBuyers(list, "name");
    expect(list[0].id).toBe("a");
  });
});

describe("deal history ordering", () => {
  it("sorts deals newest first and pushes undated ones last", () => {
    const b = {
      ...emptyBuyer(),
      deals: [
        { id: "1", date: "2026-01-05" },
        { id: "2", date: "" },
        { id: "3", date: "2026-06-30" },
      ],
    };
    expect(sortedDeals(b).map((d) => d.id)).toEqual(["3", "1", "2"]);
  });
});

describe("relative dates", () => {
  it("reports never for a missing timestamp", () => {
    expect(relativeDays(null)).toBe("never");
    expect(daysSince(null)).toBe(null);
  });

  it("formats recent and older contact", () => {
    const days = (n) => new Date(Date.now() - n * 86400000).toISOString();
    expect(relativeDays(days(0))).toBe("today");
    expect(relativeDays(days(1))).toBe("yesterday");
    expect(relativeDays(days(5))).toBe("5d ago");
    expect(relativeDays(days(60))).toBe("2mo ago");
  });
});

describe("backup round trip", () => {
  it("exports and re-parses the same buyers", () => {
    const list = [{ ...emptyBuyer(), id: "a", investorName: "Dana" }];
    const { buyers } = parseBackup(buildBackup(list));
    expect(buyers).toHaveLength(1);
    expect(buyers[0].investorName).toBe("Dana");
  });

  it("accepts a bare array too", () => {
    const { buyers } = parseBackup(JSON.stringify([{ investorName: "Solo" }]));
    expect(buyers[0].investorName).toBe("Solo");
    expect(buyers[0].deals).toEqual([]);
  });

  it("rejects junk with a readable message", () => {
    expect(() => parseBackup("not json")).toThrow(/valid JSON/);
    expect(() => parseBackup('{"nope":1}')).toThrow(/No buyers/);
  });
});
