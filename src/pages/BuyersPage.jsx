import { useState, useEffect } from "react";
import { UserPlus, Search, Users } from "lucide-react";
import Background from "../components/Background.jsx";
import SwipeUpMenu from "../components/SwipeUpMenu.jsx";
import BuyerForm from "../components/buyers/BuyerForm.jsx";
import BuyerCard from "../components/buyers/BuyerCard.jsx";
import {
  getBuyers, saveBuyer, removeBuyer, addDeal, removeDeal, displayName, buildBuyBoxText,
} from "../lib/buyers.js";
import { bodyFont, bodyFontLight, displayFont } from "../lib/fonts.js";
import { inputClass } from "../lib/ui.js";

export default function BuyersPage() {
  const [buyers, setBuyers] = useState([]);
  const [mode, setMode] = useState("list"); // "list" | "form"
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setBuyers(getBuyers());
  }, []);

  function refresh() {
    setBuyers(getBuyers());
  }

  function startNew() {
    setEditing(null);
    setMode("form");
  }

  function startEdit(buyer) {
    setEditing(buyer);
    setMode("form");
  }

  function handleSave(buyer) {
    const saved = saveBuyer(buyer);
    refresh();
    setMode("list");
    setEditing(null);
    setExpandedId(saved.id);
  }

  function handleDelete(buyer) {
    if (!window.confirm(`Delete ${displayName(buyer)}? This can't be undone.`)) return;
    removeBuyer(buyer.id);
    refresh();
  }

  // Match against the name, company, and the whole buy box so a search for a
  // zip or "BRRRR" finds the right people.
  const filtered = buyers.filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      displayName(b).toLowerCase().includes(q) ||
      (b.companyName || "").toLowerCase().includes(q) ||
      buildBuyBoxText(b).toLowerCase().includes(q)
    );
  });

  if (mode === "form") {
    return (
      <Background>
        <SwipeUpMenu />
        <BuyerForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setMode("list"); setEditing(null); }}
        />
      </Background>
    );
  }

  return (
    <Background>
      <SwipeUpMenu />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <p className="text-teal-400 text-sm mb-2" style={displayFont}>CASH BUYERS LIST</p>
          <h1 className="text-4xl sm:text-5xl text-teal-400 font-bold mb-2" style={{ ...displayFont, textShadow: "4px 4px 0 rgba(124,58,237,0.55)" }}>
            Buyers
          </h1>
          <p className="text-blue-300 text-lg" style={bodyFontLight}>
            {buyers.length ? `${buyers.length} buyer${buyers.length === 1 ? "" : "s"} on file` : "Nobody on file yet"}
          </p>
        </div>

        <button
          onClick={startNew}
          className="w-full mb-6 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-teal-500 bg-teal-600 text-blue-950 text-2xl hover:bg-teal-500"
          style={displayFont}
        >
          <UserPlus className="w-6 h-6" strokeWidth={2.5} /> Register New Buyer
        </button>

        {buyers.length > 0 && (
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, city, zip, strategy…"
              className={inputClass + " pl-11"}
              style={bodyFont}
            />
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-blue-800 rounded-xl">
            <Users className="w-10 h-10 text-blue-700 mx-auto mb-3" strokeWidth={2} />
            <p className="text-blue-400 text-lg" style={bodyFontLight}>
              {buyers.length ? "No buyers match that search." : "Register your first cash buyer to get started."}
            </p>
          </div>
        )}

        {filtered.map((b) => (
          <BuyerCard
            key={b.id}
            buyer={b}
            expanded={expandedId === b.id}
            onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)}
            onEdit={() => startEdit(b)}
            onDelete={() => handleDelete(b)}
            onAddDeal={(deal) => { addDeal(b.id, deal); refresh(); }}
            onRemoveDeal={(dealId) => { removeDeal(b.id, dealId); refresh(); }}
          />
        ))}

        <p className="text-blue-400 text-base text-center mt-6" style={bodyFontLight}>
          Saved on this device only - nothing leaves your phone.
        </p>
      </div>
    </Background>
  );
}
