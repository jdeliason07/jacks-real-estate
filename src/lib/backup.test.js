import { describe, it, expect, beforeEach } from "vitest";
import { buildBackup, parseBackup, exportBackupText, restoreBackup, describeRestore, BACKUP_VERSION } from "./backup.js";
import { getBuyers, saveBuyer, emptyBuyer } from "./buyers.js";
import { createDeal, listDeals, attachBuyer, listDealBuyers } from "./repo.js";

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

describe("buildBackup / parseBackup", () => {
  it("round-trips buyers, deals and their links", () => {
    const parsed = parseBackup(
      buildBackup({
        buyers: [{ ...emptyBuyer(), id: "b1", investorName: "Dana" }],
        deals: [{ id: "d1", address: "1 Main St", stage: "live" }],
        dealBuyers: [{ dealId: "d1", buyerId: "b1", status: "assigned" }],
      })
    );

    expect(parsed.buyers[0].investorName).toBe("Dana");
    expect(parsed.deals[0]).toMatchObject({ address: "1 Main St", stage: "live" });
    expect(parsed.dealBuyers).toEqual([{ dealId: "d1", buyerId: "b1", status: "assigned" }]);
  });

  it("stamps the current version", () => {
    expect(JSON.parse(buildBackup({})).version).toBe(BACKUP_VERSION);
  });

  it("still reads a v1 buyers-only backup", () => {
    const v1 = JSON.stringify({ app: "jacks-realty", type: "buyers-backup", version: 1, buyers: [{ investorName: "Dana" }] });
    const parsed = parseBackup(v1);
    expect(parsed.buyers[0].investorName).toBe("Dana");
    expect(parsed.deals).toEqual([]);
    expect(parsed.dealBuyers).toEqual([]);
  });

  it("still reads a bare array of buyers", () => {
    const parsed = parseBackup(JSON.stringify([{ investorName: "Solo" }]));
    expect(parsed.buyers[0].investorName).toBe("Solo");
    expect(parsed.buyers[0].deals).toEqual([]);
  });

  it("normalizes deals on the way in, so a hand-edited file can't crash the UI", () => {
    const parsed = parseBackup(JSON.stringify({ deals: [{ address: "1 Main St", stage: "nonsense", comps: null }] }));
    expect(parsed.deals[0].stage).toBe("prospective");
    expect(parsed.deals[0].comps).toEqual([{ id: 1, price: "" }]);
  });

  it("rejects junk with a readable message", () => {
    expect(() => parseBackup("not json")).toThrow(/valid JSON/);
    expect(() => parseBackup('{"nope":1}')).toThrow(/No buyers or deals/);
  });
});

describe("exportBackupText / restoreBackup", () => {
  it("captures everything on the device and puts it back", async () => {
    const buyer = saveBuyer({ investorName: "Dana Reyes" });
    const deal = await createDeal({ address: "4218 Broadview Rd", stage: "live", ddEndDate: "2026-08-12" });
    await attachBuyer(deal.id, buyer.id, "assigned");

    const text = await exportBackupText();

    // Wipe the device.
    globalThis.window.localStorage.removeItem("jacks-realty-buyers-v1");
    globalThis.window.localStorage.removeItem("jacks-realty-deals-v1");
    globalThis.window.localStorage.removeItem("jacks-realty-deal-buyers-v1");
    expect(getBuyers()).toHaveLength(0);
    expect(await listDeals()).toHaveLength(0);

    await restoreBackup(parseBackup(text));

    expect(getBuyers()[0].investorName).toBe("Dana Reyes");
    const deals = await listDeals();
    expect(deals[0]).toMatchObject({ address: "4218 Broadview Rd", ddEndDate: "2026-08-12" });
    expect((await listDealBuyers(deal.id))[0].status).toBe("assigned");
  });

  it("merges rather than wipes, and is safe to run twice", async () => {
    saveBuyer({ investorName: "Existing" });
    const kept = await createDeal({ address: "Keep me" });

    const incoming = parseBackup(buildBackup({ deals: [{ id: "d9", address: "1 Main St" }] }));
    await restoreBackup(incoming);
    await restoreBackup(incoming);

    const deals = await listDeals();
    expect(deals).toHaveLength(2);
    expect(deals.map((d) => d.address).sort()).toEqual(["1 Main St", "Keep me"]);
    expect(await getDealById(kept.id)).toBeTruthy();
    expect(getBuyers()).toHaveLength(1);
  });

  it("describes what came back", () => {
    expect(describeRestore({ buyers: { added: 2, updated: 1 }, deals: { added: 3, updated: 0 } }))
      .toBe("Restored 2 new, 1 updated buyers · 3 new, 0 updated deals.");
    expect(describeRestore({ buyers: { added: 0, updated: 0 }, deals: { added: 0, updated: 0 } }))
      .toBe("Nothing to restore from that file.");
  });
});

async function getDealById(id) {
  return (await listDeals()).find((d) => d.id === id) || null;
}
