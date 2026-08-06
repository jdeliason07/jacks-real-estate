import { Component } from "react";

/**
 * Last line of defence: a render error anywhere below shows a readable panel
 * (with a link to download a data backup) instead of a blank white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  // Storage keys are hardcoded rather than imported, for the same reason the
  // gradient below is: this screen has to work when a module fails to load.
  // Shape matches backup.js so the file restores through the normal Restore.
  downloadRaw = () => {
    try {
      const read = (key, fallback) => {
        try {
          const raw = window.localStorage.getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        } catch {
          return fallback;
        }
      };
      const dump = {
        app: "jacks-realty",
        type: "jacks-realty-backup",
        version: 2,
        exportedAt: new Date().toISOString(),
        buyers: read("jacks-realty-buyers-v1", []),
        deals: read("jacks-realty-deals-v1", []),
        dealBuyers: read("jacks-realty-deal-buyers-v1", []),
      };
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jacks-realty-raw-backup.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* nothing more we can do */
    }
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "linear-gradient(160deg, #020617 0%, #042f2e 50%, #1e1b4b 100%)",
          color: "#ccfbf1",
          fontFamily: "'Kalam', cursive",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <h1 style={{ fontFamily: "'Permanent Marker', cursive", fontSize: "2rem", color: "#2dd4bf", marginBottom: "0.75rem" }}>
            Something broke
          </h1>
          <p style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#bfdbfe" }}>
            Your saved buyers and deals are still on this device. Download a backup before reloading, just in case.
          </p>
          <pre
            style={{
              fontSize: "0.85rem",
              color: "#93c5fd",
              background: "rgba(2,6,23,0.6)",
              border: "1px solid #1e3a8a",
              borderRadius: 8,
              padding: "0.75rem",
              overflowX: "auto",
              marginBottom: "1rem",
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={this.downloadRaw}
              style={{ padding: "0.75rem 1.25rem", borderRadius: 10, border: "2px solid #14b8a6", background: "#0d9488", color: "#022c22", fontSize: "1.1rem", cursor: "pointer" }}
            >
              Download backup
            </button>
            <button
              onClick={() => window.location.assign("/")}
              style={{ padding: "0.75rem 1.25rem", borderRadius: 10, border: "2px solid #1d4ed8", background: "transparent", color: "#bfdbfe", fontSize: "1.1rem", cursor: "pointer" }}
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
