import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { fmt } from "../../lib/deal.js";
import { dealMath, dealLabel, money } from "../../lib/dealsSchema.js";
import { cardClass } from "../../lib/tokens.js";
import { bodyFont, bodyFontLight, displayFont } from "../../lib/fonts.js";
import StatusChip from "./StatusChip.jsx";

function Row({ label, value, className = "" }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-blue-400 text-lg" style={bodyFontLight}>{label}</span>
      <span className={"text-lg text-blue-100 " + className} style={bodyFont}>{value}</span>
    </div>
  );
}

/** A property still being sourced. Tapping it opens the underwriting worksheet. */
export default function DealCard({ deal }) {
  const math = dealMath(deal);

  return (
    <Link
      to={`/deals/${deal.id}`}
      className={cardClass + " mb-4 block hover:border-violet-500 transition-colors"}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-2xl text-teal-400 leading-tight" style={displayFont}>
          {dealLabel(deal)}
        </h3>
        <ChevronRight className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" strokeWidth={2.5} />
      </div>

      <div className="mb-3">
        <StatusChip status={deal.status} />
      </div>

      <div className="space-y-1">
        <Row label="Listing" value={money(deal.listingPrice)} />
        <Row
          label="Target price"
          value={math.dealWorks ? fmt(math.targetPrice) : "No deal"}
          className={math.dealWorks ? "text-teal-300 font-bold" : "text-amber-400 font-bold"}
        />
        {math.dealWorks && math.hasListing && (
          <Row
            label={math.gap <= 0 ? "Room at asking" : "Seller must drop"}
            value={fmt(Math.abs(math.gap))}
            className={math.gap <= 0 ? "text-teal-300" : "text-violet-300"}
          />
        )}
      </div>

      {deal.notes.trim() && (
        <p className="text-blue-400 text-base mt-3 line-clamp-2" style={bodyFontLight}>
          {deal.notes}
        </p>
      )}
    </Link>
  );
}
