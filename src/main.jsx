import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Self-hosted fonts (bundled at build time — no runtime Google Fonts request).
// Latin subset only, to keep the bundle small.
import "@fontsource/permanent-marker/latin-400.css";
import "@fontsource/kalam/latin-400.css";
import "@fontsource/kalam/latin-700.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
