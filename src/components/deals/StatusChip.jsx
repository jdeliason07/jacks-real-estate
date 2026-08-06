import { bodyFont } from "../../lib/fonts.js";

// Where a status sits on the way to a signed PA. Colour tracks momentum:
// neutral blue while it's just a lead, violet once a conversation is open,
// teal once there's an offer on the table, dimmed when it's dead.
const STATUS_STYLE = {
  Researching: "border-blue-700 bg-blue-950 text-blue-300",
  "Contacted Agent": "border-violet-700 bg-violet-950 text-violet-300",
  "Offer Made": "border-teal-700 bg-teal-950 text-teal-300",
  "Under Negotiation": "border-teal-500 bg-teal-950 text-teal-200",
  Dead: "border-blue-800 bg-blue-950 text-blue-500 line-through",
};

export default function StatusChip({ status }) {
  const style = STATUS_STYLE[status] || STATUS_STYLE.Researching;
  return (
    <span className={"inline-block px-3 py-1 rounded-lg border-2 text-base whitespace-nowrap " + style} style={bodyFont}>
      {status}
    </span>
  );
}
