import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Printer, AlertTriangle } from "lucide-react";
import Background from "../components/Background.jsx";
import SwipeUpMenu from "../components/SwipeUpMenu.jsx";
import Field from "../components/Field.jsx";
import { getDeal, listDealBuyers } from "../lib/repo.js";
import { displayName } from "../lib/buyers.js";
import { dealLabel, todayISO } from "../lib/dealsSchema.js";
import { formatDateLong } from "../lib/countdown.js";
import { getSettings, saveSettings } from "../lib/settings.js";
import { alertClass, cardClass, headingStyle, primaryButtonClass, secondaryButtonClass } from "../lib/tokens.js";
import { bodyFont, bodyFontLight, displayFont } from "../lib/fonts.js";
import useDocumentTitle from "../lib/useDocumentTitle.js";

const BLANK = "____________________";

/**
 * One-click Notice of Termination, filled from the deal record.
 *
 * Output is a print-friendly sheet plus window.print() — on every phone and
 * desktop browser that dialog offers "Save as PDF", which is the whole
 * requirement met without shipping a PDF library to every visitor.
 */
export default function TerminationNoticePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [state, setState] = useState("loading");
  const [entityName, setEntityName] = useState("");
  const [terminationDate, setTerminationDate] = useState(todayISO());

  useDocumentTitle("Notice of Termination");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const d = await getDeal(id);
      if (cancelled) return;
      setDeal(d);
      setState(d ? "ready" : "missing");
      if (d) setBuyers(await listDealBuyers(d.id));
      setEntityName(getSettings().entityName);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Remember the entity — you sign as the same one every time.
  function changeEntity(v) {
    setEntityName(v);
    saveSettings({ entityName: v });
  }

  if (state === "loading") {
    return (
      <Background>
        <p className="text-blue-400 text-lg text-center py-16" style={bodyFontLight}>Loading…</p>
        <SwipeUpMenu />
      </Background>
    );
  }

  if (state === "missing") {
    return (
      <Background>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className={cardClass + " text-center"}>
            <p className="text-blue-300 text-lg mb-4" style={bodyFontLight}>That deal isn't on this device.</p>
            <button onClick={() => navigate("/deals")} className={secondaryButtonClass + " mx-auto"} style={bodyFont}>
              Back to Deals
            </button>
          </div>
        </div>
        <SwipeUpMenu />
      </Background>
    );
  }

  const buyerNames = buyers.map((l) => displayName(l.buyer));
  const entity = entityName.trim() || BLANK;
  const seller = (deal.sellerName || "").trim() || BLANK;

  return (
    <Background>
      <div className="print-page max-w-2xl mx-auto px-4 py-10">
        {/* ---- Screen-only controls ---- */}
        <div className="no-print">
          <Link to={`/deals/${deal.id}`} className="inline-flex items-center gap-1 text-teal-400 text-lg mb-4 hover:text-teal-300" style={bodyFont}>
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} /> Back to deal
          </Link>

          <div className="mb-6">
            <p className="text-teal-400 text-sm mb-2" style={displayFont}>DUE-DILIGENCE EXIT</p>
            <h1 className="text-3xl sm:text-4xl text-teal-400 font-bold" style={headingStyle}>
              Notice of Termination
            </h1>
          </div>

          <section className={cardClass + " mb-6"}>
            <h2 className="text-2xl text-violet-400 mb-4" style={displayFont}>Before you print</h2>
            <Field
              label="Your entity name"
              value={entityName}
              onChange={changeEntity}
              placeholder="e.g. Jack's Realty Holdings LLC"
              hint="Saved for next time."
            />
            <Field label="Termination date" type="date" value={terminationDate} onChange={setTerminationDate} />
            {!deal.sellerName && (
              <p className="text-blue-400 text-base" style={bodyFontLight}>
                No seller on file — the notice leaves a blank to fill in. Add one on the deal to have it filled automatically.
              </p>
            )}
          </section>

          <div role="note" className={alertClass("warn") + " mb-6"}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1 text-amber-400" strokeWidth={2.5} />
            <span className="text-lg" style={bodyFontLight}>
              Template only. Your purchase agreement's own notice clause governs how and by when
              termination must be delivered — have your attorney review this before you send it.
            </span>
          </div>

          <button onClick={() => window.print()} className={primaryButtonClass + " mb-6"} style={displayFont}>
            <Printer className="w-6 h-6" strokeWidth={2.5} /> Print / Save as PDF
          </button>
        </div>

        {/* ---- The document itself ---- */}
        <article className="print-sheet bg-white text-black rounded-xl p-8 sm:p-10 leading-relaxed">
          <h2 className="text-center text-xl font-bold uppercase tracking-wide mb-8">
            Notice of Termination of Purchase Agreement
          </h2>

          <dl className="mb-8 space-y-1">
            <Line label="Date" value={formatDateLong(terminationDate)} />
            <Line label="Property" value={dealLabel(deal)} />
            <Line label="Seller" value={seller} />
            <Line label="Purchaser" value={entity} />
            <Line label="Purchase Agreement dated" value={formatDateLong(deal.paSignedDate)} />
            <Line label="Inspection period ends" value={formatDateLong(deal.ddEndDate)} />
          </dl>

          <p className="mb-4">To the Seller named above, and to all interested parties:</p>

          <p className="mb-4">
            Purchaser hereby gives notice that, pursuant to the inspection and due-diligence
            contingency contained in the Purchase Agreement dated {formatDateLong(deal.paSignedDate)} for
            the property at {dealLabel(deal)}, Purchaser elects to terminate the Purchase Agreement.
          </p>

          <p className="mb-4">
            This notice is given on or before the expiration of the inspection period, which ends
            on {formatDateLong(deal.ddEndDate)}. Termination is effective
            as of {formatDateLong(terminationDate)}.
          </p>

          <p className="mb-4">
            Purchaser requests that all earnest money and deposits held under the Purchase Agreement be
            released and returned to Purchaser promptly, and that the escrow holder be instructed
            accordingly. Neither party shall have any further obligation under the Purchase Agreement
            except as to those provisions that expressly survive termination.
          </p>

          {buyerNames.length > 0 && (
            <p className="mb-4">
              Copies of this notice have been provided to the following prospective assignees:{" "}
              {buyerNames.join(", ")}.
            </p>
          )}

          <div className="mt-12">
            <p className="mb-1">Sincerely,</p>
            <p className="font-bold mb-8">{entity}</p>
            <p className="mb-1">By: {BLANK}</p>
            <p className="mb-1">Name / Title: {BLANK}</p>
            <p>Date: {formatDateLong(terminationDate)}</p>
          </div>

          <p className="mt-10 pt-4 border-t border-neutral-300 text-sm">
            This is a template prepared for the sender's own use and is not legal advice. Delivery
            method and deadline are governed by the notice provisions of the Purchase Agreement.
          </p>
        </article>
      </div>
      <SwipeUpMenu />
    </Background>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex gap-2">
      <dt className="font-bold whitespace-nowrap">{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}
