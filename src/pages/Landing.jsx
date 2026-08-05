import Background from "../components/Background.jsx";
import Menu from "../components/Menu.jsx";
import { displayFont } from "../lib/fonts.js";

// Deliberately minimal: just the brand, centered, with the dropdown menu in
// the top-right corner. Everything else lives behind the menu.
export default function Landing() {
  return (
    <Background>
      <Menu />
      <div className="min-h-dvh flex items-center justify-center text-center px-4">
        <h1
          className="electric text-6xl sm:text-8xl font-bold leading-[0.95]"
          style={displayFont}
        >
          <span className="block">Jack&apos;s</span>
          <span className="block">Realty</span>
        </h1>
      </div>
    </Background>
  );
}
