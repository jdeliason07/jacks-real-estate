import Background from "../components/Background.jsx";
import SwipeUpMenu from "../components/SwipeUpMenu.jsx";
import DealCalculator from "../components/calculator/DealCalculator.jsx";

export default function CalculatorPage() {
  return (
    <Background>
      <DealCalculator />
      <SwipeUpMenu />
    </Background>
  );
}
