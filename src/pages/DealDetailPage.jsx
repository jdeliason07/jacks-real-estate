import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, AlertTriangle, Trash2, FileSignature, Undo2, FileText,
  ChevronDown, ChevronUp, Check,
} from "lucide-react";
import Background from "../components/Background.jsx";
import SwipeUpMenu from "../components/SwipeUpMenu.jsx";
import Field from "../components/Field.jsx";
import DealCalculator from "../components/calculator/DealCalculator.jsx";
import CountdownBanner from "../components/deals/CountdownBanner.jsx";
import BuyerAttachList from "../components/deals/BuyerAttachList.jsx";
import PromoteToLiveForm from "../components/deals/PromoteToLiveForm.jsx";
import {
  getDeal, updateDeal, deleteDeal, listDealBuyers, attachBuyer, detachBuyer, setDealBuyerStatus,
} from "../lib/repo.js";
import { getBuyers } from "../lib/buyers.js";
import {
  calcStateFromDeal, dealPatchFromCalcState, dealLabel, isLive, PROSPECT_STATUSES,
} from "../lib/dealsSchema.js";
import useDebouncedSave from "../lib/useDebouncedSave.js";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import {
  alertClass, cardClass, cardTealClass, chipClass, dangerButtonClass,
  headingStyle, inputClass, primaryButtonClass, secondaryButtonClass,
} from "../lib/tokens.js";
import { bodyFont, bodyFontLight, displayFont } from "../lib/fonts.js";

export default function DealDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | missing

  useEffect(() => {
    let cancelled = false;
    getDeal(id).then((d) => {
      if (cancelled) return;
      setDeal(d);
      setState(d ? "ready" : "missing");
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Background>
      <div className="max-w-2xl mx-auto px-4 py-10">
        {state === "loading" && (
          <p className="text-blue-400 text-lg text-center py-12" style={bodyFontLight}>Loading deal…</p>
        )}
        {state === "missing" && (
          <div className={cardClass + " text-center"}>
            <p className="text-blue-300 text-lg mb-4" style={bodyFontLight}>That deal isn't on this device.</p>
            <button onClick={() => navigate("/deals")} className={secondaryButtonClass + " mx-auto"} style={bodyFont}>
              Back to Deals
            </button>
          </div>
        )}
        {/* Remount on id change so the editor's draft and its debounced save
            always belong to the deal on screen. */}
        {state === "ready" && <DealEditor key={deal.id} initialDeal={deal} />}
      </div>
      <SwipeUpMenu />
    </Background>
  );
}

function DealEditor({ initialDeal }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(initialDeal);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(0);
  const [promoting, setPromoting] = useState(false);
  const [showUnderwriting, setShowUnderwriting] = useState(false);

  const [attached, setAttached] = useState([]);
  const [allBuyers, setAllBuyers] = useState([]);

  const live = isLive(draft);
  useDocumentTitle(dealLabel(draft));

  const refreshBuyers = useCallback(async () => {
    setAttached(await listDealBuyers(draft.id));
    setAllBuyers(getBuyers());
  }, [draft.id]);

  useEffect(() => {
    refreshBuyers();
  }, [refreshBuyers]);

  // One debounced write for the whole record — typing in a comp field and
  // typing in the notes box both land in the same save.
  const save = useCallback(async (value) => {
    try {
      await updateDeal(value.id, value);
      setError("");
      setSavedAt(Date.now());
    } catch (e) {
      setError(e.message || "Couldn't save this deal.");
    }
  }, []);
  useDebouncedSave(draft, save);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const calcState = useMemo(() => calcStateFromDeal(draft), [draft]);
  const onCalcChange = (next) => setDraft((d) => ({ ...d, ...dealPatchFromCalcState(next) }));

  // Stage changes are deliberate, one-off decisions — they get written
  // straight through rather than sitting in the typing debounce.
  async function commit(patch) {
    const next = { ...draft, ...patch };
    setDraft(next);
    await save(next);
  }

  function goLive(fields) {
    setPromoting(false);
    commit({ ...fields, stage: "live" });
  }

  function backToProspective() {
    if (!window.confirm("Move this back to Prospective? The contract dates stay saved.")) return;
    commit({ stage: "prospective" });
  }

  async function remove() {
    if (!window.confirm(`Delete ${dealLabel(draft)}? This can't be undone.`)) return;
    await deleteDeal(draft.id);
    navigate("/deals");
  }

  return (
    <>
      <Link
        to={live ? "/deals?tab=live" : "/deals"}
        className="inline-flex items-center gap-1 text-teal-400 text-lg mb-4 hover:text-teal-300"
        style={bodyFont}
      >
        <ArrowLeft className="w-5 h-5" strokeWidth={2.5} /> All deals
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <p className="text-teal-400 text-sm" style={displayFont}>
            {live ? "UNDER CONTRACT" : "UNDERWRITING"}
          </p>
          {savedAt > 0 && !error && (
            <span className="inline-flex items-center gap-1 text-blue-500 text-base" style={bodyFontLight}>
              <Check className="w-4 h-4" strokeWidth={2.5} /> Saved
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl text-teal-400 font-bold" style={headingStyle}>
          {dealLabel(draft)}
        </h1>
      </div>

      {error && (
        <div role="alert" className={alertClass("warn") + " mb-6"}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1 text-amber-400" strokeWidth={2.5} />
          <span className="text-lg" style={bodyFontLight}>{error}</span>
        </div>
      )}

      {live && <CountdownBanner date={draft.ddEndDate} className="mb-6" />}

      {/* ---- Property ---- */}
      <section className={cardClass + " mb-6"}>
        <h2 className="text-2xl text-violet-400 mb-4" style={displayFont}>Property</h2>
        <Field label="Address" value={draft.address} onChange={(v) => set({ address: v })} placeholder="e.g. 4218 Broadview Rd" />

        {!live && (
          <div className="mb-4">
            <p className="text-lg text-blue-300 mb-2" style={bodyFontLight}>Status</p>
            <div className="flex gap-2 flex-wrap">
              {PROSPECT_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set({ status: s })}
                  aria-pressed={draft.status === s}
                  className={chipClass(draft.status === s)}
                  style={bodyFont}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <label htmlFor="deal-notes" className="text-lg text-blue-300 block mb-1" style={bodyFontLight}>Notes</label>
        <textarea
          id="deal-notes"
          rows={3}
          value={draft.notes}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="Agent said the seller wants a quick close…"
          className={inputClass}
          style={bodyFont}
        />
      </section>

      {/* ---- Live-deal contract terms ---- */}
      {live && (
        <section className={cardTealClass + " mb-6"}>
          <h2 className="text-2xl text-teal-400 mb-4" style={displayFont}>Contract</h2>
          <Field label="Seller" value={draft.sellerName} onChange={(v) => set({ sellerName: v })} hint="As named on the purchase agreement." />
          <Field label="Contract price ($)" numeric value={draft.contractPrice} onChange={(v) => set({ contractPrice: v })} />
          <Field label="Assignment fee ($)" numeric value={draft.assignmentFee} onChange={(v) => set({ assignmentFee: v })} />
          <Field label="PA signed date" type="date" value={draft.paSignedDate} onChange={(v) => set({ paSignedDate: v })} />
          <Field
            label="DD / inspection period ends"
            type="date"
            value={draft.ddEndDate}
            onChange={(v) => set({ ddEndDate: v })}
            hint="The countdown above recomputes from this date."
          />
          <Field label="Projected close date" type="date" value={draft.projectedCloseDate} onChange={(v) => set({ projectedCloseDate: v })} />
        </section>
      )}

      {/* ---- Buyers (live deals only) ---- */}
      {live && (
        <BuyerAttachList
          attached={attached}
          allBuyers={allBuyers}
          onAttach={async (buyerId) => {
            await attachBuyer(draft.id, buyerId);
            refreshBuyers();
          }}
          onDetach={async (buyerId) => {
            await detachBuyer(draft.id, buyerId);
            refreshBuyers();
          }}
          onStatusChange={async (buyerId, status) => {
            await setDealBuyerStatus(draft.id, buyerId, status);
            refreshBuyers();
          }}
        />
      )}

      {/* ---- Underwriting ---- */}
      {!live ? (
        <DealCalculator state={calcState} onChange={onCalcChange} showHeader={false} />
      ) : (
        <section className="mb-6">
          <button
            onClick={() => setShowUnderwriting((v) => !v)}
            aria-expanded={showUnderwriting}
            className={secondaryButtonClass + " w-full"}
            style={bodyFont}
          >
            {showUnderwriting ? <ChevronUp className="w-5 h-5" strokeWidth={2.5} /> : <ChevronDown className="w-5 h-5" strokeWidth={2.5} />}
            {showUnderwriting ? "Hide underwriting" : "Show underwriting"}
          </button>
          {showUnderwriting && (
            <div className="mt-4">
              <DealCalculator state={calcState} onChange={onCalcChange} showHeader={false} />
            </div>
          )}
        </section>
      )}

      {/* ---- Stage actions ---- */}
      {!live && (
        promoting ? (
          <PromoteToLiveForm deal={draft} onSubmit={goLive} onCancel={() => setPromoting(false)} />
        ) : (
          <button onClick={() => setPromoting(true)} className={primaryButtonClass + " mb-6"} style={displayFont}>
            <FileSignature className="w-6 h-6" strokeWidth={2.5} /> PA Signed - Move to Live
          </button>
        )
      )}

      {live && (
        <div className="flex flex-col gap-2 mb-6">
          <Link to={`/deals/${draft.id}/termination`} className={secondaryButtonClass} style={bodyFont}>
            <FileText className="w-5 h-5" strokeWidth={2.5} /> Notice of Termination
          </Link>
          <button onClick={backToProspective} className={secondaryButtonClass} style={bodyFont}>
            <Undo2 className="w-5 h-5" strokeWidth={2.5} /> Back to Prospective
          </button>
        </div>
      )}

      <div className="pt-6 border-t border-blue-800">
        <button onClick={remove} className={dangerButtonClass + " w-full"} style={bodyFont}>
          <Trash2 className="w-5 h-5" strokeWidth={2.5} /> Delete this deal
        </button>
      </div>
    </>
  );
}
