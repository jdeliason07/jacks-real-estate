import { bodyFont } from "../lib/fonts.js";

function Ring({ style }) {
  return <div className="fixed rounded-full pointer-events-none" style={style} />;
}

// Shared page shell: the dark gradient + concentric corner rings used across
// every page of the site, so new pages inherit the same look.
//
// The `app-shell` class is the hook the print rules hang off: the gradient is
// an inline style, so no stylesheet could drop it for printing without one.
export default function Background({ children }) {
  return (
    <div
      className="app-shell min-h-dvh relative overflow-hidden"
      style={{ ...bodyFont, background: "linear-gradient(160deg, #020617 0%, #042f2e 50%, #1e1b4b 100%)" }}
    >
      <Ring style={{ bottom: "-160px", right: "-160px", width: "220px", height: "220px", border: "1px solid rgba(45,212,191,0.25)" }} />
      <Ring style={{ bottom: "-220px", right: "-220px", width: "380px", height: "380px", border: "1px solid rgba(124,58,237,0.22)" }} />
      <Ring style={{ bottom: "-280px", right: "-280px", width: "540px", height: "540px", border: "1px solid rgba(45,212,191,0.15)" }} />
      <Ring style={{ bottom: "-340px", right: "-340px", width: "700px", height: "700px", border: "1px solid rgba(124,58,237,0.1)" }} />
      <div className="wave-sweep" aria-hidden="true" />
      <div className="relative" style={{ zIndex: 1 }}>{children}</div>
    </div>
  );
}
