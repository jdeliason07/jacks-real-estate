import { useState } from "react";
import { User, MapPin, Home, DollarSign, Wrench, Handshake, Check } from "lucide-react";
import {
  emptyBuyer,
  MONTHLY_VOLUME,
  ASSET_TYPES,
  STRATEGIES,
  DISCOUNT_RULES,
  REHAB_SCOPE,
  DEAL_BREAKERS,
  FUNDING_TYPES,
  POF_STATUS,
  CLOSING_TIMELINE,
} from "../../lib/buyers.js";
import { bodyFont, bodyFontLight, displayFont } from "../../lib/fonts.js";
import { inputClass } from "../../lib/ui.js";

function Section({ icon: Icon, n, title, accent = "teal", children }) {
  const border = accent === "violet" ? "border-violet-700" : "border-teal-700";
  const color = accent === "violet" ? "text-violet-400" : "text-teal-400";
  return (
    <section className={"mb-6 bg-blue-900 border-2 rounded-xl p-6 " + border}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={"w-6 h-6 " + color} strokeWidth={2.5} />
        <h2 className={"text-2xl " + color} style={displayFont}>
          {n}. {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="text-lg text-blue-300 block mb-1" style={bodyFontLight}>{label}</label>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-1 px-3 py-2 rounded-lg border-2 text-lg " +
        (active ? "border-teal-500 bg-teal-950 text-teal-200" : "border-blue-800 bg-blue-950 text-blue-300 hover:border-blue-600")
      }
      style={bodyFont}
    >
      {active && <Check className="w-4 h-4 flex-shrink-0" strokeWidth={3} />}
      {children}
    </button>
  );
}

// Single-select group
function ChoiceGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} active={value === o} onClick={() => onChange(value === o ? "" : o)}>{o}</Chip>
      ))}
    </div>
  );
}

// Multi-select group
function ChipGroup({ options, values, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} active={values.includes(o)} onClick={() => onToggle(o)}>{o}</Chip>
      ))}
    </div>
  );
}

export default function BuyerForm({ initial, onSave, onCancel }) {
  const [b, setB] = useState(() => ({ ...emptyBuyer(), ...(initial || {}) }));

  const set = (patch) => setB((s) => ({ ...s, ...patch }));
  const toggle = (field, val) =>
    setB((s) => {
      const arr = s[field] || [];
      return { ...s, [field]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });

  function submit(e) {
    e.preventDefault();
    onSave(b);
  }

  const editing = Boolean(b.id);

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-teal-400 text-sm mb-2" style={displayFont}>CASH BUYER INTAKE</p>
        <h1 className="text-4xl sm:text-5xl text-teal-400 font-bold mb-2" style={{ ...displayFont, textShadow: "4px 4px 0 rgba(124,58,237,0.55)" }}>
          {editing ? "Edit Buyer" : "Register New Buyer"}
        </h1>
        <p className="text-blue-300 text-lg" style={bodyFontLight}>Fill this out during or right after the call.</p>
      </div>

      {/* 1. Investor & Entity */}
      <Section icon={User} n="1" title="Investor & Entity">
        <Field label="Investor name">
          <input className={inputClass} style={bodyFont} value={b.investorName} onChange={(e) => set({ investorName: e.target.value })} />
        </Field>
        <Field label="Company / entity name">
          <input className={inputClass} style={bodyFont} value={b.companyName} onChange={(e) => set({ companyName: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Email">
            <input type="email" className={inputClass} style={bodyFont} value={b.email} onChange={(e) => set({ email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <input type="tel" className={inputClass} style={bodyFont} value={b.phone} onChange={(e) => set({ phone: e.target.value })} />
          </Field>
          <Field label="FB / IG">
            <input className={inputClass} style={bodyFont} value={b.social} onChange={(e) => set({ social: e.target.value })} />
          </Field>
        </div>
        <Field label="Target monthly volume">
          <ChoiceGroup options={MONTHLY_VOLUME} value={b.monthlyVolume} onChange={(v) => set({ monthlyVolume: v })} />
        </Field>
      </Section>

      {/* 2. Target Market */}
      <Section icon={MapPin} n="2" title="Target Market" accent="violet">
        <Field label="Target city & state">
          <input className={inputClass} style={bodyFont} value={b.targetCityState} onChange={(e) => set({ targetCityState: e.target.value })} placeholder="e.g. Columbus, OH" />
        </Field>
        <Field label="Target neighborhoods / zips">
          <input className={inputClass} style={bodyFont} value={b.neighborhoodsZips} onChange={(e) => set({ neighborhoodsZips: e.target.value })} placeholder="e.g. 43201, 43202, Clintonville" />
        </Field>
        <Field label="Locations / areas to avoid">
          <input className={inputClass} style={bodyFont} value={b.areasToAvoid} onChange={(e) => set({ areasToAvoid: e.target.value })} />
        </Field>
      </Section>

      {/* 3. Property Criteria */}
      <Section icon={Home} n="3" title="Property Criteria">
        <Field label="Asset type">
          <ChipGroup options={ASSET_TYPES} values={b.assetTypes} onToggle={(v) => toggle("assetTypes", v)} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Min beds">
            <input type="number" className={inputClass} style={bodyFont} value={b.minBeds} onChange={(e) => set({ minBeds: e.target.value })} />
          </Field>
          <Field label="Min baths">
            <input type="number" className={inputClass} style={bodyFont} value={b.minBaths} onChange={(e) => set({ minBaths: e.target.value })} />
          </Field>
          <Field label="Min sqft">
            <input type="number" className={inputClass} style={bodyFont} value={b.minSqft} onChange={(e) => set({ minSqft: e.target.value })} />
          </Field>
        </div>
        <Field label="Strategy">
          <ChipGroup options={STRATEGIES} values={b.strategies} onToggle={(v) => toggle("strategies", v)} />
        </Field>
      </Section>

      {/* 4. Financial & Underwriting */}
      <Section icon={DollarSign} n="4" title="Financial & Underwriting" accent="violet">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Target ARV ($)">
            <input type="number" className={inputClass} style={bodyFont} value={b.arv} onChange={(e) => set({ arv: e.target.value })} />
          </Field>
          <Field label="Max purchase ($)">
            <input type="number" className={inputClass} style={bodyFont} value={b.maxPurchase} onChange={(e) => set({ maxPurchase: e.target.value })} />
          </Field>
          <Field label="Max rehab budget ($)">
            <input type="number" className={inputClass} style={bodyFont} value={b.maxRehab} onChange={(e) => set({ maxRehab: e.target.value })} />
          </Field>
        </div>
        <Field label="Target discount rule">
          <ChoiceGroup options={DISCOUNT_RULES} value={b.discountRule} onChange={(v) => set({ discountRule: v })} />
        </Field>
        {b.discountRule === "Custom" && (
          <Field label="Custom rule">
            <input className={inputClass} style={bodyFont} value={b.discountCustom} onChange={(e) => set({ discountCustom: e.target.value })} placeholder="e.g. 65% ARV minus rehab minus $10k" />
          </Field>
        )}
        <Field label="Finder / wholesale fee ($)">
          <input type="number" className={inputClass} style={bodyFont} value={b.finderFee} onChange={(e) => set({ finderFee: e.target.value })} />
        </Field>
      </Section>

      {/* 5. Condition & Scope */}
      <Section icon={Wrench} n="5" title="Condition & Scope">
        <Field label="Acceptable rehab scope">
          <ChipGroup options={REHAB_SCOPE} values={b.rehabScope} onToggle={(v) => toggle("rehabScope", v)} />
        </Field>
        <Field label="Absolute deal breakers">
          <ChipGroup options={DEAL_BREAKERS} values={b.dealBreakers} onToggle={(v) => toggle("dealBreakers", v)} />
        </Field>
      </Section>

      {/* 6. Transaction & Closing */}
      <Section icon={Handshake} n="6" title="Transaction & Closing" accent="violet">
        <Field label="Funding type">
          <ChipGroup options={FUNDING_TYPES} values={b.fundingType} onToggle={(v) => toggle("fundingType", v)} />
        </Field>
        <Field label="Proof of funds status">
          <ChoiceGroup options={POF_STATUS} value={b.pofStatus} onChange={(v) => set({ pofStatus: v })} />
        </Field>
        <Field label="Target closing timeline">
          <ChoiceGroup options={CLOSING_TIMELINE} value={b.closingTimeline} onChange={(v) => set({ closingTimeline: v })} />
        </Field>
        <Field label="Notes">
          <textarea className={inputClass + " min-h-24"} style={bodyFont} value={b.notes} onChange={(e) => set({ notes: e.target.value })} />
        </Field>
      </Section>

      <div className="flex gap-3">
        <button type="submit" className="flex-1 py-3 rounded-xl border-2 border-teal-500 bg-teal-600 text-blue-950 text-xl hover:bg-teal-500" style={displayFont}>
          {editing ? "Save changes" : "Save buyer"}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl border-2 border-blue-700 bg-blue-900 text-blue-300 text-xl hover:bg-blue-800" style={displayFont}>
          Cancel
        </button>
      </div>
    </form>
  );
}
