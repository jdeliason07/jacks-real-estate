// The one place deals are read from and written to.
//
// Everything here is async even though the current driver (localStorage) is
// synchronous. That's deliberate: it's the seam. Swapping in Supabase — or any
// other backend — means rewriting the bodies in this file and nothing else,
// because no caller has ever been allowed to assume a synchronous read.
//
// Buyers still live in buyers.js; this module joins against them rather than
// duplicating that store.

import { getBuyers } from "./buyers.js";
import { normalizeDeal, BUYER_STATUSES } from "./dealsSchema.js";

const DEALS_KEY = "jacks-realty-deals-v1";
const LINKS_KEY = "jacks-realty-deal-buyers-v1";

// ---- localStorage driver --------------------------------------------------

function readList(key) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Unlike saveBuyer(), a failed write is *not* swallowed. Losing a deal you just
 * typed in because the quota filled silently is the worst outcome this app has,
 * so it surfaces as a rejected promise and the UI shows it.
 */
function writeList(key, list) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    throw new Error("Couldn't save — this device's storage is full. Back up and clear some space.");
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const nowISO = () => new Date().toISOString();

function readDeals() {
  return readList(DEALS_KEY).map(normalizeDeal);
}

/** Junction rows: { dealId, buyerId, status }. A plain many-to-many. */
function readLinks() {
  return readList(LINKS_KEY)
    .filter((l) => l && l.dealId && l.buyerId)
    .map((l) => ({
      dealId: l.dealId,
      buyerId: l.buyerId,
      status: BUYER_STATUSES.includes(l.status) ? l.status : "interested",
    }));
}

// ---- Deals ----------------------------------------------------------------

export async function listDeals() {
  // Newest first, matching the Buyers list default.
  return readDeals().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function getDeal(id) {
  return readDeals().find((d) => d.id === id) || null;
}

export async function createDeal(partial = {}) {
  const list = readDeals();
  const deal = normalizeDeal({ ...partial, id: uid(), createdAt: nowISO(), updatedAt: nowISO() });
  list.push(deal);
  writeList(DEALS_KEY, list);
  return deal;
}

/** Shallow field patch. Returns the saved deal, or null if the id is unknown. */
export async function updateDeal(id, patch) {
  const list = readDeals();
  const i = list.findIndex((d) => d.id === id);
  if (i < 0) return null;
  const saved = normalizeDeal({ ...list[i], ...patch, id, updatedAt: nowISO() });
  list[i] = saved;
  writeList(DEALS_KEY, list);
  return saved;
}

export async function deleteDeal(id) {
  writeList(DEALS_KEY, readDeals().filter((d) => d.id !== id));
  // Don't leave junction rows pointing at a deal that no longer exists.
  writeList(LINKS_KEY, readLinks().filter((l) => l.dealId !== id));
}

// ---- Deal ↔ buyer junction ------------------------------------------------

/**
 * Buyers attached to a deal, joined with the buyer record so cards can render
 * a name without a second round trip. Links to deleted buyers are skipped.
 */
export async function listDealBuyers(dealId) {
  const buyers = getBuyers();
  return readLinks()
    .filter((l) => l.dealId === dealId)
    .map((l) => ({ ...l, buyer: buyers.find((b) => b.id === l.buyerId) || null }))
    .filter((l) => l.buyer);
}

/** Attach, or update the status if this buyer is already on the deal. */
export async function attachBuyer(dealId, buyerId, status = "interested") {
  const links = readLinks();
  const existing = links.find((l) => l.dealId === dealId && l.buyerId === buyerId);
  if (existing) existing.status = status;
  else links.push({ dealId, buyerId, status });
  writeList(LINKS_KEY, links);
}

export async function detachBuyer(dealId, buyerId) {
  writeList(LINKS_KEY, readLinks().filter((l) => !(l.dealId === dealId && l.buyerId === buyerId)));
}

export async function setDealBuyerStatus(dealId, buyerId, status) {
  return attachBuyer(dealId, buyerId, status);
}

/** The other direction — one buyer can sit on any number of deals at once. */
export async function listDealsForBuyer(buyerId) {
  const ids = new Set(readLinks().filter((l) => l.buyerId === buyerId).map((l) => l.dealId));
  return readDeals().filter((d) => ids.has(d.id));
}

/** Called when a buyer is deleted, so no link outlives its buyer. */
export async function detachAllForBuyer(buyerId) {
  writeList(LINKS_KEY, readLinks().filter((l) => l.buyerId !== buyerId));
}

// ---- Bulk access (backup) -------------------------------------------------

export async function exportSnapshot() {
  return { deals: readDeals(), dealBuyers: readLinks() };
}

/**
 * Merge a snapshot in. Deals with a known id replace the local copy; the rest
 * are appended. Links are de-duplicated on (dealId, buyerId).
 */
export async function importSnapshot({ deals = [], dealBuyers = [] } = {}) {
  const list = readDeals();
  let added = 0;
  let updated = 0;

  for (const raw of deals) {
    const d = normalizeDeal(raw);
    const i = d.id ? list.findIndex((x) => x.id === d.id) : -1;
    if (i >= 0) {
      list[i] = d;
      updated++;
    } else {
      list.push({ ...d, id: d.id || uid(), createdAt: d.createdAt || nowISO() });
      added++;
    }
  }
  writeList(DEALS_KEY, list);

  const links = readLinks();
  for (const raw of dealBuyers) {
    if (!raw || !raw.dealId || !raw.buyerId) continue;
    const existing = links.find((l) => l.dealId === raw.dealId && l.buyerId === raw.buyerId);
    if (existing) existing.status = BUYER_STATUSES.includes(raw.status) ? raw.status : existing.status;
    else links.push({ dealId: raw.dealId, buyerId: raw.buyerId, status: BUYER_STATUSES.includes(raw.status) ? raw.status : "interested" });
  }
  writeList(LINKS_KEY, links);

  return { added, updated };
}
