import { useState, useEffect, useRef } from "react";
import { UserPlus, Search, Users, Download, Upload } from "lucide-react";
import Background from "../components/Background.jsx";
import SwipeUpMenu from "../components/SwipeUpMenu.jsx";
import BuyerForm from "../components/buyers/BuyerForm.jsx";
import BuyerCard from "../components/buyers/BuyerCard.jsx";
import {
  getBuyers, saveBuyer, removeBuyer, addDeal, removeDeal, displayName, buildBuyBoxText,
  markContacted, sortBuyers, SORTS,
} from "../lib/buyers.js";
import { exportBackupText, parseBackup, restoreBackup, describeRestore } from "../lib/backup.js";
import { detachAllForBuyer } from "../lib/repo.js";
import { bodyFont, bodyFontLight, displayFont } from "../lib/fonts.js";
import { inputClass } from "../lib/ui.js";
import useDocumentTitle from "../lib/useDocumentTitle.js";

export default function BuyersPage() {
  const [buyers, setBuyers] = useState([]);
  const [mode, setMode] = useState("list"); // "list" | "form"
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [flash, setFlash] = useState("");
  const fileRef = useRef(null);

  useDocumentTitle(mode === "form" ? (editing ? "Edit Buyer" : "New Buyer") : "Buyers");

  useEffect(() => {
    setBuyers(getBuyers());
  }, []);

  const refresh = () => setBuyers(getBuyers());

  function note(msg) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3000);
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

  async function handleDelete(buyer) {
    if (!window.confirm(`Delete ${displayName(buyer)}? This can't be undone.`)) return;
    removeBuyer(buyer.id);
    // Don't leave this buyer attached to deals they no longer exist for.
    await detachAllForBuyer(buyer.id);
    refresh();
  }

  // Download every record as JSON — the only safeguard against losing the
  // browser's storage (cleared data, lost phone, new device). Covers deals and
  // their buyer attachments as well as the buyers themselves.
  async function exportBackup() {
    const blob = new Blob([await exportBackupText()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jacks-realty-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    note("Backup downloaded.");
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-importing the same file
    if (!file) return;
    try {
      const result = await restoreBackup(parseBackup(await file.text()));
      refresh();
      note(describeRestore(result));
    } catch (err) {
      note(err.message || "Could not read that file.");
    }
  }

  // Match name, company, and the whole buy box so a zip or "BRRRR" finds people.
  const q = query.trim().toLowerCase();
  const filtered = sortBuyers(
    buyers.filter((b) =>
      !q ||
      displayName(b).toLowerCase().includes(q) ||
      (b.companyName || "").toLowerCase().includes(q) ||
      buildBuyBoxText(b).toLowerCase().includes(q)
    ),
    sort
  );

  if (mode === "form") {
    return (
      <Background>
        <BuyerForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setMode("list"); setEditing(null); }}
        />
        <SwipeUpMenu />
      </Background>
    );
  }

  return (
    <Background>
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

        {flash && (
          <div role="status" className="mb-4 p-3 rounded-lg border-2 border-teal-700 bg-teal-950 text-teal-200 text-lg text-center" style={bodyFontLight}>
            {flash}
          </div>
        )}

        <button
          onClick={startNew}
          className="w-full mb-6 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-teal-500 bg-teal-600 text-blue-950 text-2xl hover:bg-teal-500"
          style={displayFont}
        >
          <UserPlus className="w-6 h-6" strokeWidth={2.5} /> Register New Buyer
        </button>

        {buyers.length > 0 && (
          <>
            <div className="relative mb-3">
              <Search className="w-5 h-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, city, zip, strategy…"
                aria-label="Search buyers"
                className={inputClass + " pl-11"}
                style={bodyFont}
              />
            </div>

            <div className="flex gap-2 mb-6">
              {Object.entries(SORTS).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  aria-pressed={sort === key}
                  className={
                    "px-3 py-2 rounded-lg border-2 text-base " +
                    (sort === key ? "border-teal-500 bg-teal-950 text-teal-200" : "border-blue-800 bg-blue-950 text-blue-400 hover:border-blue-600")
                  }
                  style={bodyFont}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </>
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
            onContact={() => { markContacted(b.id); refresh(); }}
          />
        ))}

        {/* Backup — localStorage is one cleared cache away from empty. */}
        <div className="mt-8 pt-6 border-t border-blue-800">
          <div className="flex gap-2">
            <button
              onClick={exportBackup}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-blue-700 bg-blue-950 text-blue-300 text-lg hover:bg-blue-800"
              style={bodyFont}
            >
              <Download className="w-5 h-5" strokeWidth={2.5} /> Back up
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-blue-700 bg-blue-950 text-blue-300 text-lg hover:bg-blue-800"
              style={bodyFont}
            >
              <Upload className="w-5 h-5" strokeWidth={2.5} /> Restore
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
          </div>
          <p className="text-blue-500 text-base text-center mt-3" style={bodyFontLight}>
            Saved on this device only. Back up regularly - clearing your browser data erases these
            records. The backup covers your deals too.
          </p>
        </div>
      </div>
      <SwipeUpMenu />
    </Background>
  );
}
