import { useState } from "react";
import {
  Mail, Phone, MessageSquare, ChevronDown, ChevronUp, Copy, Check,
  Pencil, Trash2, Plus, Target, History,
} from "lucide-react";
import {
  buildBuyBoxSummary, buildBuyBoxText, mailtoHref, telHref, smsHref,
  displayName, emptyDeal, DEAL_STATUS,
} from "../../lib/buyers.js";
import { fmt } from "../../lib/deal.js";
import { bodyFont, bodyFontLight, displayFont } from "../../lib/fonts.js";
import { inputClass } from "../../lib/ui.js";

function money(v) {
  const n = parseFloat(v);
  return isFinite(n) ? fmt(n) : "";
}

// One-tap contact button. Renders as a link when the buyer has that detail,
// otherwise a disabled-looking stub so the row stays stable.
function ContactButton({ href, icon: Icon, label, accent }) {
  const base = "flex items-center justify-center gap-2 flex-1 py-3 rounded-lg border-2 text-lg";
  if (!href) {
    return (
      <span className={base + " border-blue-800 bg-blue-950 text-blue-600"} style={bodyFontLight}>
        <Icon className="w-5 h-5" strokeWidth={2.5} /> {label}
      </span>
    );
  }
  const color =
    accent === "violet"
      ? "border-violet-600 bg-violet-950 text-violet-200 hover:bg-violet-900"
      : "border-teal-600 bg-teal-950 text-teal-200 hover:bg-teal-900";
  return (
    <a href={href} className={base + " " + color} style={bodyFont}>
      <Icon className="w-5 h-5" strokeWidth={2.5} /> {label}
    </a>
  );
}

function DealForm({ onAdd, onCancel }) {
  const [d, setD] = useState(emptyDeal);
  const set = (patch) => setD((s) => ({ ...s, ...patch }));

  return (
    <div className="mt-3 p-4 rounded-lg border-2 border-blue-800 bg-blue-950">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-base text-blue-300 block mb-1" style={bodyFontLight}>Date</label>
          <input type="date" className={inputClass} style={bodyFont} value={d.date} onChange={(e) => set({ date: e.target.value })} />
        </div>
        <div>
          <label className="text-base text-blue-300 block mb-1" style={bodyFontLight}>Address</label>
          <input className={inputClass} style={bodyFont} value={d.address} onChange={(e) => set({ address: e.target.value })} placeholder="123 Main St" />
        </div>
        <div>
          <label className="text-base text-blue-300 block mb-1" style={bodyFontLight}>Property type</label>
          <input className={inputClass} style={bodyFont} value={d.propertyType} onChange={(e) => set({ propertyType: e.target.value })} placeholder="3/2 SFR" />
        </div>
        <div>
          <label className="text-base text-blue-300 block mb-1" style={bodyFontLight}>Status</label>
          <select className={inputClass} style={bodyFont} value={d.status} onChange={(e) => set({ status: e.target.value })}>
            {DEAL_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-base text-blue-300 block mb-1" style={bodyFontLight}>Sale price ($)</label>
          <input type="number" className={inputClass} style={bodyFont} value={d.price} onChange={(e) => set({ price: e.target.value })} />
        </div>
        <div>
          <label className="text-base text-blue-300 block mb-1" style={bodyFontLight}>Your fee ($)</label>
          <input type="number" className={inputClass} style={bodyFont} value={d.fee} onChange={(e) => set({ fee: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onAdd(d)} className="px-4 py-2 rounded-lg border-2 border-teal-500 bg-teal-600 text-blue-950 text-lg" style={bodyFont}>
          Add deal
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border-2 border-blue-700 text-blue-300 text-lg" style={bodyFont}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function BuyerCard({ buyer, expanded, onToggle, onEdit, onDelete, onAddDeal, onRemoveDeal }) {
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);

  const summary = buildBuyBoxSummary(buyer);
  const deals = buyer.deals || [];
  const closed = deals.filter((d) => d.status === "Closed");
  const totalFees = closed.reduce((sum, d) => sum + (parseFloat(d.fee) || 0), 0);

  async function copyBuyBox() {
    try {
      await navigator.clipboard.writeText(buildBuyBoxText(buyer));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — ignore
    }
  }

  return (
    <div className="mb-4 bg-blue-900 border-2 border-teal-700 rounded-xl overflow-hidden">
      {/* Header — always visible, tap to expand */}
      <button onClick={onToggle} className="w-full text-left p-5 hover:bg-blue-800/50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-2xl text-teal-400 truncate" style={displayFont}>{displayName(buyer)}</h3>
            {buyer.companyName && buyer.investorName && (
              <p className="text-blue-400 text-base truncate" style={bodyFontLight}>{buyer.companyName}</p>
            )}
            <p className="text-blue-300 text-lg truncate" style={bodyFontLight}>
              {[buyer.targetCityState, buyer.maxPurchase ? `up to ${money(buyer.maxPurchase)}` : null]
                .filter(Boolean).join(" · ") || "No buy box yet"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {closed.length > 0 && (
              <span className="px-2 py-1 rounded-md bg-teal-950 border border-teal-700 text-teal-300 text-base" style={bodyFont}>
                {closed.length} closed
              </span>
            )}
            {expanded ? <ChevronUp className="w-6 h-6 text-teal-400" strokeWidth={2.5} /> : <ChevronDown className="w-6 h-6 text-teal-400" strokeWidth={2.5} />}
          </div>
        </div>
      </button>

      {/* Contact row — one tap, always available */}
      <div className="flex gap-2 px-5 pb-5">
        <ContactButton href={mailtoHref(buyer)} icon={Mail} label="Email" />
        <ContactButton href={telHref(buyer)} icon={Phone} label="Call" accent="violet" />
        <ContactButton href={smsHref(buyer)} icon={MessageSquare} label="Text" accent="violet" />
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-blue-800 pt-5">
          {/* Buy box — brief, Zillow-ready */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-400" strokeWidth={2.5} />
              <h4 className="text-xl text-violet-400" style={displayFont}>Buy Box</h4>
            </div>
            <button onClick={copyBuyBox} className="flex items-center gap-1 text-base text-teal-400 hover:text-teal-300" style={bodyFont}>
              {copied ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
              {copied ? "Copied!" : "Copy for Zillow"}
            </button>
          </div>

          {summary.length ? (
            <div className="space-y-1 mb-5">
              {summary.map((r) => (
                <div key={r.label} className="flex gap-2 text-lg">
                  <span className="text-blue-400 w-20 flex-shrink-0" style={bodyFontLight}>{r.label}</span>
                  <span className="text-blue-100" style={bodyFont}>{r.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-blue-500 text-lg mb-5" style={bodyFontLight}>No buy box details captured yet.</p>
          )}

          {/* Extra terms worth knowing before you call */}
          {(buyer.fundingType?.length || buyer.closingTimeline || buyer.pofStatus || buyer.monthlyVolume) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {buyer.monthlyVolume && <Tag>{buyer.monthlyVolume}/mo</Tag>}
              {buyer.fundingType?.map((f) => <Tag key={f}>{f}</Tag>)}
              {buyer.pofStatus && <Tag>POF: {buyer.pofStatus}</Tag>}
              {buyer.closingTimeline && <Tag>Closes {buyer.closingTimeline}</Tag>}
            </div>
          )}

          {buyer.notes && (
            <p className="text-blue-300 text-lg mb-5 whitespace-pre-wrap" style={bodyFontLight}>{buyer.notes}</p>
          )}

          {/* Deal history */}
          <div className="flex items-center justify-between mb-3 pt-4 border-t border-blue-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-teal-400" strokeWidth={2.5} />
              <h4 className="text-xl text-teal-400" style={displayFont}>Deal History</h4>
            </div>
            {totalFees > 0 && (
              <span className="text-base text-teal-300" style={bodyFont}>{fmt(totalFees)} in fees</span>
            )}
          </div>

          {deals.length ? (
            <div className="space-y-2">
              {deals.map((d) => (
                <div key={d.id} className="flex items-start justify-between gap-2 p-3 rounded-lg bg-blue-950 border border-blue-800">
                  <div className="min-w-0">
                    <p className="text-blue-100 text-lg truncate" style={bodyFont}>
                      {d.address || "(no address)"}
                    </p>
                    <p className="text-blue-400 text-base" style={bodyFontLight}>
                      {[d.date, d.propertyType, d.price ? money(d.price) : null, d.fee ? `fee ${money(d.fee)}` : null]
                        .filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={
                      "px-2 py-1 rounded-md text-base border " +
                      (d.status === "Closed" ? "bg-teal-950 border-teal-700 text-teal-300"
                        : d.status === "Under Contract" ? "bg-violet-950 border-violet-700 text-violet-300"
                        : "bg-blue-950 border-blue-700 text-blue-400")
                    } style={bodyFont}>{d.status}</span>
                    <button onClick={() => onRemoveDeal(d.id)} className="p-1 text-blue-500 hover:text-violet-400" aria-label="Remove deal">
                      <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-blue-500 text-lg" style={bodyFontLight}>No deals logged yet.</p>
          )}

          {adding ? (
            <DealForm
              onAdd={(d) => { onAddDeal(d); setAdding(false); }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button onClick={() => setAdding(true)} className="mt-3 flex items-center gap-1 text-lg text-teal-400 hover:text-teal-300" style={bodyFont}>
              <Plus className="w-4 h-4" strokeWidth={2.5} /> Log a deal
            </button>
          )}

          {/* Record actions */}
          <div className="flex gap-3 mt-5 pt-4 border-t border-blue-800">
            <button onClick={onEdit} className="flex items-center gap-1 text-lg text-blue-300 hover:text-teal-300" style={bodyFont}>
              <Pencil className="w-4 h-4" strokeWidth={2.5} /> Edit
            </button>
            <button onClick={onDelete} className="flex items-center gap-1 text-lg text-blue-500 hover:text-violet-400" style={bodyFont}>
              <Trash2 className="w-4 h-4" strokeWidth={2.5} /> Delete buyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="px-2 py-1 rounded-md bg-blue-950 border border-blue-800 text-blue-300 text-base" style={bodyFontLight}>
      {children}
    </span>
  );
}
