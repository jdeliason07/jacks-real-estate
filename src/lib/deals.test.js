import { describe, it, expect, beforeEach } from "vitest";
import {
  emptyDeal, normalizeDeal, calcStateFromDeal, dealPatchFromCalcState,
  dealMath, liveFieldsFrom, todayISO, dealLabel, money, PROSPECT_STATUSES,
} from "./dealsSchema.js";
import {
  listDeals, getDeal, createDeal, updateDeal, deleteDeal,
  listDealBuyers, attachBuyer, detachBuyer, setDealBuyerStatus,
  listDealsForBuyer, detachAllForBuyer,
} from "./repo.js";
import { saveBuyer } from "./buyers.js";

/**
 * The suite runs in node, so there's no window. A Map-backed stand-in is enough
 * for the storage driver and keeps these tests honest end-to-end rather than
 * mocking the repo away.
 */
beforeEach(() => {
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
  };
});

// A deal whose numbers are easy to check: ARV 200k, 70% rule, no rehab, 5k fee.
const underwritten = {
  address: "4218 Broadview Rd",
  comps: [{ id: 1, price: "200000" }],
  rulePercent: "70",
  assignmentFee: "5000",
  listingPrice: "120000",
};

describe("normalizeDeal", () => {
  it("fills in everything a partial record is missing", () => {
    const d = normalizeDeal({ address: "1 Main St" });
    expect(d.address).toBe("1 Main St");
    expect(d.stage).toBe("prospective");
    expect(d.status).toBe("Researching");
    expect(d.notes).toBe("");
    expect(Object.keys(d).sort()).toEqual(Object.keys(emptyDeal()).sort());
  });

  it("falls back to a known stage and status rather than trusting the file", () => {
    expect(normalizeDeal({ stage: "banana" }).stage).toBe("prospective");
    expect(normalizeDeal({ status: "Vibing" }).status).toBe("Researching");
    expect(normalizeDeal({ stage: "live" }).stage).toBe("live");
    for (const s of PROSPECT_STATUSES) expect(normalizeDeal({ status: s }).status).toBe(s);
  });

  it("always leaves at least one comp row for the calculator to render", () => {
    expect(normalizeDeal({ comps: [] }).comps).toEqual([{ id: 1, price: "" }]);
    expect(normalizeDeal({ comps: "nope" }).comps).toHaveLength(1);
    expect(normalizeDeal({ comps: [null, { price: "1" }] }).comps).toEqual([{ id: 1, price: "1" }]);
  });

  it("keeps numeric inputs as strings, the way the calculator holds them", () => {
    const d = normalizeDeal({ listingPrice: 120000, arv: 200000, rulePercent: 70 });
    expect(d.listingPrice).toBe("120000");
    expect(d.arv).toBe("200000");
    expect(d.rulePercent).toBe("70");
    expect(normalizeDeal({ sqft: null }).sqft).toBe("");
  });
});

describe("calculator bridge", () => {
  it("round-trips underwriting fields without losing anything", () => {
    const deal = normalizeDeal({
      ...underwritten,
      arvOverride: true,
      arv: "215000",
      sqft: "1200",
      rehabTier: "heavy",
      rehabPerSqft: "75",
      rehabOverride: true,
      rehabTotal: "90000",
    });

    const back = dealPatchFromCalcState(calcStateFromDeal(deal));

    for (const f of Object.keys(back)) expect(back[f]).toEqual(deal[f]);
  });

  it("maps the two names that differ between the shapes", () => {
    const s = calcStateFromDeal(normalizeDeal({ arv: "215000", assignmentFee: "7500", rehabTier: "light" }));
    expect(s.arvManual).toBe("215000");
    expect(s.fee).toBe("7500");
    expect(s.tier).toBe("light");
  });

  it("runs the deal through the existing calculator math", () => {
    const math = dealMath(normalizeDeal(underwritten));
    expect(math.ARV).toBe(200000);
    expect(math.ruleAmount).toBe(140000);
    expect(math.targetPrice).toBe(135000);
    expect(math.dealWorks).toBe(true);
    // Listing is 120k against a 135k target, so there's room at asking.
    expect(math.gap).toBe(-15000);
  });

  it("survives an empty deal instead of throwing", () => {
    expect(dealMath(emptyDeal()).dealWorks).toBe(false);
  });
});

describe("liveFieldsFrom", () => {
  it("pre-fills the contract price from the underwriting", () => {
    const f = liveFieldsFrom(normalizeDeal(underwritten));
    expect(f.contractPrice).toBe("135000");
    expect(f.assignmentFee).toBe("5000");
    expect(f.paSignedDate).toBe(todayISO());
    expect(f.ddEndDate).toBe("");
  });

  it("leaves the price blank when the numbers don't work", () => {
    const dead = normalizeDeal({ comps: [{ id: 1, price: "50000" }], rulePercent: "70", assignmentFee: "90000" });
    expect(liveFieldsFrom(dead).contractPrice).toBe("");
  });

  it("keeps values already entered rather than recomputing over them", () => {
    const f = liveFieldsFrom(normalizeDeal({ ...underwritten, contractPrice: "128500", paSignedDate: "2026-08-01" }));
    expect(f.contractPrice).toBe("128500");
    expect(f.paSignedDate).toBe("2026-08-01");
  });
});

describe("todayISO / dealLabel / money", () => {
  it("formats today in the local calendar, not UTC", () => {
    expect(todayISO(new Date(2026, 7, 6, 23, 30))).toBe("2026-08-06");
    expect(todayISO(new Date(2026, 0, 1, 0, 5))).toBe("2026-01-01");
  });

  it("never renders a blank heading", () => {
    expect(dealLabel({ address: "  " })).toBe("Untitled deal");
    expect(dealLabel(null)).toBe("Untitled deal");
    expect(dealLabel({ address: "1 Main St" })).toBe("1 Main St");
  });

  it("shows a dash for an unfilled amount instead of $0", () => {
    expect(money("")).toBe("—");
    expect(money("120000")).toBe("$120,000");
  });
});

describe("deal storage", () => {
  it("creates, reads back, and updates a deal", async () => {
    const created = await createDeal(underwritten);
    expect(created.id).toBeTruthy();
    expect(await getDeal(created.id)).toMatchObject({ address: "4218 Broadview Rd" });

    await updateDeal(created.id, { status: "Offer Made" });
    expect((await getDeal(created.id)).status).toBe("Offer Made");
    expect(await listDeals()).toHaveLength(1);
  });

  it("returns null rather than throwing for an unknown id", async () => {
    expect(await getDeal("nope")).toBeNull();
    expect(await updateDeal("nope", { address: "x" })).toBeNull();
  });

  it("carries the underwriting across the move to live", async () => {
    const created = await createDeal(underwritten);
    const live = await updateDeal(created.id, {
      stage: "live",
      contractPrice: "135000",
      paSignedDate: "2026-08-01",
      ddEndDate: "2026-08-12",
    });

    expect(live.stage).toBe("live");
    expect(live.comps).toEqual(created.comps);
    expect(live.rulePercent).toBe("70");
    expect(live.assignmentFee).toBe("5000");
    expect(dealMath(live).targetPrice).toBe(135000);

    // ...and back again, without losing the contract dates.
    const back = await updateDeal(created.id, { stage: "prospective" });
    expect(back.ddEndDate).toBe("2026-08-12");
    expect(dealMath(back).targetPrice).toBe(135000);
  });

  it("deletes a deal", async () => {
    const created = await createDeal(underwritten);
    await deleteDeal(created.id);
    expect(await listDeals()).toHaveLength(0);
  });
});

describe("deal ↔ buyer junction", () => {
  it("puts one buyer on more than one deal at the same time", async () => {
    const buyer = saveBuyer({ investorName: "Dana Reyes" });
    const a = await createDeal({ address: "1 Main St", stage: "live" });
    const b = await createDeal({ address: "2 Oak Ave", stage: "live" });

    await attachBuyer(a.id, buyer.id, "assigned");
    await attachBuyer(b.id, buyer.id, "interested");

    expect(await listDealBuyers(a.id)).toHaveLength(1);
    expect((await listDealBuyers(b.id))[0].status).toBe("interested");

    const forBuyer = await listDealsForBuyer(buyer.id);
    expect(forBuyer.map((d) => d.address).sort()).toEqual(["1 Main St", "2 Oak Ave"]);
  });

  it("holds a shortlist of buyers on one deal", async () => {
    const one = saveBuyer({ investorName: "Dana" });
    const two = saveBuyer({ investorName: "Sam" });
    const deal = await createDeal({ address: "1 Main St", stage: "live" });

    await attachBuyer(deal.id, one.id);
    await attachBuyer(deal.id, two.id);
    expect(await listDealBuyers(deal.id)).toHaveLength(2);

    await detachBuyer(deal.id, one.id);
    const left = await listDealBuyers(deal.id);
    expect(left).toHaveLength(1);
    expect(left[0].buyer.investorName).toBe("Sam");
  });

  it("updates a status in place instead of attaching twice", async () => {
    const buyer = saveBuyer({ investorName: "Dana" });
    const deal = await createDeal({ address: "1 Main St", stage: "live" });

    await attachBuyer(deal.id, buyer.id, "interested");
    await attachBuyer(deal.id, buyer.id, "interested");
    await setDealBuyerStatus(deal.id, buyer.id, "assigned");

    const links = await listDealBuyers(deal.id);
    expect(links).toHaveLength(1);
    expect(links[0].status).toBe("assigned");
  });

  it("cleans up links when either side is deleted", async () => {
    const buyer = saveBuyer({ investorName: "Dana" });
    const a = await createDeal({ address: "1 Main St", stage: "live" });
    const b = await createDeal({ address: "2 Oak Ave", stage: "live" });
    await attachBuyer(a.id, buyer.id);
    await attachBuyer(b.id, buyer.id);

    await deleteDeal(a.id);
    expect(await listDealsForBuyer(buyer.id)).toHaveLength(1);

    await detachAllForBuyer(buyer.id);
    expect(await listDealBuyers(b.id)).toHaveLength(0);
  });

  it("hides links whose buyer no longer exists", async () => {
    const deal = await createDeal({ address: "1 Main St", stage: "live" });
    await attachBuyer(deal.id, "ghost-id");
    expect(await listDealBuyers(deal.id)).toEqual([]);
  });
});
