import { useEffect, useState } from "react";
import { Users, Mail } from "lucide-react";
import { getBuyers, matchingBuyers, mailtoHref, markContacted, displayName } from "../../lib/buyers.js";
import { fmt } from "../../lib/deal.js";
import { bodyFont, bodyFontLight, displayFont } from "../../lib/fonts.js";

/**
 * Which saved buyers could take this deal? Compares the buyer's max offer and
 * rehab against each buy box. Only rendered when the deal actually works and
 * there are buyers on file, so it stays out of the way otherwise.
 */
export default function MatchingBuyers({ deal }) {
  const [buyers, setBuyers] = useState([]);

  useEffect(() => {
    setBuyers(getBuyers());
  }, []);

  if (!buyers.length || !deal.dealWorks) return null;

  const matches = matchingBuyers(buyers, deal);

  return (
    <section className="bg-blue-900 border-2 border-teal-700 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-6 h-6 text-teal-400" strokeWidth={2.5} />
        <h2 className="text-2xl text-teal-400" style={displayFont}>Buyers This Fits</h2>
      </div>
      <p className="text-blue-300 text-lg mb-4" style={bodyFontLight}>
        Buy boxes that clear a {fmt(deal.buyerMAO)} offer with {fmt(deal.rehabTotal)} of rehab.
      </p>

      {matches.length === 0 ? (
        <p className="text-blue-500 text-lg" style={bodyFontLight}>
          None of your {buyers.length} buyer{buyers.length === 1 ? "" : "s"} fit these numbers.
        </p>
      ) : (
        <div className="space-y-2">
          {matches.map((b) => {
            const href = mailtoHref(b);
            return (
              <div key={b.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-blue-950 border border-blue-800">
                <div className="min-w-0">
                  <p className="text-blue-100 text-lg truncate" style={bodyFont}>{displayName(b)}</p>
                  <p className="text-blue-400 text-base truncate" style={bodyFontLight}>
                    {[b.targetCityState, b.maxPurchase ? `up to ${fmt(parseFloat(b.maxPurchase))}` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {href && (
                  <a
                    href={href}
                    onClick={() => markContacted(b.id)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-teal-600 bg-teal-950 text-teal-200 text-base flex-shrink-0"
                    style={bodyFont}
                  >
                    <Mail className="w-4 h-4" strokeWidth={2.5} /> Email
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
