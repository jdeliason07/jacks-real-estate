import Background from "../components/Background.jsx";
import SwipeUpMenu from "../components/SwipeUpMenu.jsx";
import DealCalculator from "../components/calculator/DealCalculator.jsx";
import useDocumentTitle from "../lib/useDocumentTitle.js";

export default function CalculatorPage() {
  // The title belongs to the route, not the calculator — the same component
  // also renders inside a deal, where the page names the property instead.
  useDocumentTitle("Deal Calculator");

  return (
    <Background>
      <DealCalculator />
      <SwipeUpMenu />
    </Background>
  );
}
