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

  downloadRaw = () => {
    try {
      const blob = new Blob([window.localStorage.getItem("jacks-realty-buyers-v1") || "[]"], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jacks-realty-buyers-raw.json";
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
            Your saved buyers are still on this device. Download a backup before reloading, just in case.
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
