import Background from "../components/Background.jsx";
import SwipeUpMenu from "../components/SwipeUpMenu.jsx";
import { displayFont } from "../lib/fonts.js";

// Deliberately minimal: just the brand, centered. Navigation stays hidden
// until the user swipes up, which slides the menu sheet in from the bottom.
export default function Landing() {
  return (
    <Background>
      <div className="min-h-dvh flex items-center justify-center text-center px-4">
        <h1
          className="electric text-6xl sm:text-8xl font-bold leading-[0.95]"
          style={displayFont}
        >
          <span className="block">Jack&apos;s</span>
          <span className="block">Realty</span>
        </h1>
      </div>
      <SwipeUpMenu />
    </Background>
  );
}
