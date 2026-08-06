// Back up / restore everything on the device: buyers, deals, and the links
// between them.
//
// This lives in its own module rather than in buyers.js because a backup now
// spans two stores, and buyers.js can't import repo.js without a cycle (repo
// reads buyers to join them onto deals).
//
// On localStorage this file *is* the durability story — clearing browser data
// is one tap away — so anything worth keeping has to be covered here.

import { getBuyers, normalizeBuyer, importBuyers } from "./buyers.js";
import { normalizeDeal } from "./dealsSchema.js";
import { exportSnapshot, importSnapshot } from "./repo.js";

export const BACKUP_VERSION = 2;

/** Serialise explicit data. Pure — the async gathering is exportBackupText(). */
export function buildBackup({ buyers = [], deals = [], dealBuyers = [] } = {}) {
  return JSON.stringify(
    {
      app: "jacks-realty",
      type: "jacks-realty-backup",
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      buyers,
      deals,
      dealBuyers,
    },
    null,
    2
  );
}

/**
 * Parse a backup file into normalized records.
 *
 * Accepts three shapes, because old files are still out there and a restore
 * that rejects last year's backup is worse than useless:
 *   - v2: { buyers, deals, dealBuyers }
 *   - v1: { buyers }              (buyers-only export)
 *   - a bare array of buyers
 *
 * Throws with a readable message rather than returning a partial result.
 */
export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  if (Array.isArray(data)) {
    return { buyers: data.map(normalizeBuyer), deals: [], dealBuyers: [] };
  }
  if (!data || typeof data !== "object") {
    throw new Error("That file isn't a Jack's Realty backup.");
  }

  const buyers = Array.isArray(data.buyers) ? data.buyers : null;
  const deals = Array.isArray(data.deals) ? data.deals : null;
  if (!buyers && !deals) {
    throw new Error("No buyers or deals found in that file.");
  }

  return {
    buyers: (buyers || []).map(normalizeBuyer),
    deals: (deals || []).map(normalizeDeal),
    dealBuyers: Array.isArray(data.dealBuyers) ? data.dealBuyers : [],
  };
}

/** Gather everything on the device into backup text. */
export async function exportBackupText() {
  const { deals, dealBuyers } = await exportSnapshot();
  return buildBackup({ buyers: getBuyers(), deals, dealBuyers });
}

/**
 * Merge a parsed backup into storage. Matching ids replace the local copy,
 * everything else is appended — so restoring twice is safe, and restoring onto
 * a device that already has records adds rather than wipes.
 */
export async function restoreBackup({ buyers = [], deals = [], dealBuyers = [] }) {
  const buyerResult = buyers.length ? importBuyers(buyers) : { added: 0, updated: 0 };
  const dealResult = await importSnapshot({ deals, dealBuyers });
  return { buyers: buyerResult, deals: dealResult };
}

/** "Restored 2 new buyers, 1 updated · 3 new deals" — for the flash message. */
export function describeRestore({ buyers, deals }) {
  const bits = [];
  if (buyers.added || buyers.updated) bits.push(`${buyers.added} new, ${buyers.updated} updated buyer${buyers.added + buyers.updated === 1 ? "" : "s"}`);
  if (deals.added || deals.updated) bits.push(`${deals.added} new, ${deals.updated} updated deal${deals.added + deals.updated === 1 ? "" : "s"}`);
  return bits.length ? `Restored ${bits.join(" · ")}.` : "Nothing to restore from that file.";
}
