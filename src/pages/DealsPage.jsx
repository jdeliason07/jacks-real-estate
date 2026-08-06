import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, AlertTriangle, ClipboardList, Anchor } from "lucide-react";
import Background from "../components/Background.jsx";
import SwipeUpMenu from "../components/SwipeUpMenu.jsx";
import Field from "../components/Field.jsx";
import DealCard from "../components/deals/DealCard.jsx";
import LiveDealCard from "../components/deals/LiveDealCard.jsx";
import { listDeals, listDealBuyers, createDeal } from "../lib/repo.js";
import { PROSPECT_STATUSES, isLive, isProspective } from "../lib/dealsSchema.js";
import { daysUntil } from "../lib/countdown.js";
import {
  alertClass, cardClass, chipClass, emptyStateClass, headingStyle,
  primaryButtonClass, secondaryButtonClass,
} from "../lib/tokens.js";
import { bodyFont, bodyFontLight, displayFont } from "../lib/fonts.js";
import useDocumentTitle from "../lib/useDocumentTitle.js";

const ALL = "All";

export default function DealsPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "live" ? "live" : "prospective";
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [buyersByDeal, setBuyersByDeal] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ address: "", listingPrice: "" });
  const [statusFilter, setStatusFilter] = useState(ALL);

  useDocumentTitle("Deals");

  const refresh = useCallback(async () => {
    try {
      const list = await listDeals();
      setDeals(list);
      // Only live cards show buyer chips, so only join those.
      const entries = await Promise.all(
        list.filter(isLive).map(async (d) => [d.id, await listDealBuyers(d.id)])
      );
      setBuyersByDeal(Object.fromEntries(entries));
      setError("");
    } catch (e) {
      setError(e.message || "Couldn't load deals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function selectTab(next) {
    setParams(next === "live" ? { tab: "live" } : {}, { replace: true });
  }

  async function addDeal(e) {
    e.preventDefault();
    try {
      const created = await createDeal({ address: draft.address, listingPrice: draft.listingPrice });
      navigate(`/deals/${created.id}`);
    } catch (err) {
      setError(err.message || "Couldn't create that deal.");
    }
  }

  const prospective = deals
    .filter(isProspective)
    .filter((d) => statusFilter === ALL || d.status === statusFilter);

  // Soonest deadline first — the point of the Live tab is knowing what's about
  // to expire. Deals with no date set sink to the bottom.
  const live = deals.filter(isLive).sort((a, b) => {
    const da = daysUntil(a.ddEndDate);
    const db = daysUntil(b.ddEndDate);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  });

  const prospectiveCount = deals.filter(isProspective).length;

  return (
    <Background>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <p className="text-teal-400 text-sm mb-2" style={displayFont}>PIPELINE</p>
          <h1 className="text-4xl sm:text-5xl text-teal-400 font-bold mb-2" style={headingStyle}>
            Deals
          </h1>
          <p className="text-blue-300 text-lg" style={bodyFontLight}>
            Sourcing on the left, under contract on the right
          </p>
        </div>

        {error && (
          <div role="alert" className={alertClass("warn") + " mb-6"}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1 text-amber-400" strokeWidth={2.5} />
            <span className="text-lg" style={bodyFontLight}>{error}</span>
          </div>
        )}

        {/* Tabs. The active tab lives in the URL so the back button and a
            home-screen shortcut both land where you expect. */}
        <div role="tablist" aria-label="Deal stage" className="flex gap-2 mb-6">
          <button
            role="tab"
            aria-selected={tab === "prospective"}
            onClick={() => selectTab("prospective")}
            className={chipClass(tab === "prospective") + " flex-1 flex items-center justify-center gap-2 py-3 text-lg"}
            style={bodyFont}
          >
            <ClipboardList className="w-5 h-5" strokeWidth={2.5} />
            Prospective ({prospectiveCount})
          </button>
          <button
            role="tab"
            aria-selected={tab === "live"}
            onClick={() => selectTab("live")}
            className={chipClass(tab === "live") + " flex-1 flex items-center justify-center gap-2 py-3 text-lg"}
            style={bodyFont}
          >
            <Anchor className="w-5 h-5" strokeWidth={2.5} />
            Live ({live.length})
          </button>
        </div>

        {loading && (
          <p className="text-blue-400 text-lg text-center py-12" style={bodyFontLight}>Loading deals…</p>
        )}

        {!loading && tab === "prospective" && (
          <>
            {adding ? (
              <form onSubmit={addDeal} className={cardClass + " mb-6"}>
                <h2 className="text-2xl text-violet-400 mb-4" style={displayFont}>New deal</h2>
                <Field
                  label="Property address"
                  value={draft.address}
                  onChange={(v) => setDraft({ ...draft, address: v })}
                  placeholder="e.g. 4218 Broadview Rd"
                  autoFocus
                />
                <Field
                  label="Listing price ($)"
                  numeric
                  value={draft.listingPrice}
                  onChange={(v) => setDraft({ ...draft, listingPrice: v })}
                />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setAdding(false)} className={secondaryButtonClass + " flex-1"} style={bodyFont}>
                    Cancel
                  </button>
                  <button type="submit" className={primaryButtonClass + " flex-1"} style={displayFont}>
                    Start Underwriting
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setAdding(true)} className={primaryButtonClass + " mb-6"} style={displayFont}>
                <Plus className="w-6 h-6" strokeWidth={2.5} /> Add a Property
              </button>
            )}

            {prospectiveCount > 0 && (
              <div className="flex gap-2 mb-6 flex-wrap">
                {[ALL, ...PROSPECT_STATUSES].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    aria-pressed={statusFilter === s}
                    className={chipClass(statusFilter === s)}
                    style={bodyFont}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {prospective.length === 0 ? (
              <div className={emptyStateClass}>
                <ClipboardList className="w-10 h-10 text-blue-700 mx-auto mb-3" strokeWidth={2} />
                <p className="text-blue-400 text-lg" style={bodyFontLight}>
                  {prospectiveCount
                    ? "No deals with that status."
                    : "Nothing in the pipeline. Add a property to start underwriting it."}
                </p>
              </div>
            ) : (
              prospective.map((d) => <DealCard key={d.id} deal={d} />)
            )}
          </>
        )}

        {!loading && tab === "live" && (
          <>
            {live.length === 0 ? (
              <div className={emptyStateClass}>
                <Anchor className="w-10 h-10 text-blue-700 mx-auto mb-3" strokeWidth={2} />
                <p className="text-blue-400 text-lg" style={bodyFontLight}>
                  No signed contracts yet. Move a prospective deal to Live once the PA is signed.
                </p>
              </div>
            ) : (
              live.map((d) => <LiveDealCard key={d.id} deal={d} buyers={buyersByDeal[d.id] || []} />)
            )}
          </>
        )}

        <p className="text-blue-500 text-base text-center mt-8" style={bodyFontLight}>
          Saved on this device only. Back up from the Buyers page - it covers deals too.
        </p>
      </div>
      <SwipeUpMenu />
    </Background>
  );
}
