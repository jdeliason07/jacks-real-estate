import { Link } from "react-router-dom";
import { ChevronRight, Users } from "lucide-react";
import { formatDate } from "../../lib/countdown.js";
import { dealLabel, money } from "../../lib/dealsSchema.js";
import { displayName } from "../../lib/buyers.js";
import { cardTealClass } from "../../lib/tokens.js";
import { bodyFont, bodyFontLight, displayFont } from "../../lib/fonts.js";
import CountdownBanner from "./CountdownBanner.jsx";

function Row({ label, value, className = "" }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-blue-400 text-lg" style={bodyFontLight}>{label}</span>
      <span className={"text-lg text-blue-100 " + className} style={bodyFont}>{value}</span>
    </div>
  );
}

/**
 * A property under contract. The countdown leads, because on a live deal the
 * deadline is the only number that can cost you money by being ignored.
 */
export default function LiveDealCard({ deal, buyers = [] }) {
  return (
    <Link
      to={`/deals/${deal.id}`}
      className={cardTealClass + " mb-4 block hover:border-teal-500 transition-colors"}
    >
      <CountdownBanner date={deal.ddEndDate} className="mb-4" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-2xl text-teal-400 leading-tight" style={displayFont}>
          {dealLabel(deal)}
        </h3>
        <ChevronRight className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" strokeWidth={2.5} />
      </div>

      <div className="space-y-1 mb-3">
        <Row label="Contract price" value={money(deal.contractPrice)} />
        <Row label="Assignment fee" value={money(deal.assignmentFee)} className="text-teal-300 font-bold" />
        <Row label="PA signed" value={formatDate(deal.paSignedDate)} />
        <Row label="Projected close" value={formatDate(deal.projectedCloseDate)} />
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-blue-800">
        <Users className="w-5 h-5 text-blue-500 flex-shrink-0" strokeWidth={2.5} />
        {buyers.length === 0 ? (
          <span className="text-blue-500 text-base" style={bodyFontLight}>No buyers attached yet</span>
        ) : (
          buyers.map((l) => (
            <span
              key={l.buyerId}
              className="px-2 py-1 rounded-lg border-2 border-blue-800 bg-blue-950 text-blue-300 text-base"
              style={bodyFont}
            >
              {displayName(l.buyer)}
            </span>
          ))
        )}
      </div>
    </Link>
  );
}
