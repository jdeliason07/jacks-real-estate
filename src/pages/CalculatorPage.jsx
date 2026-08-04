import Background from "../components/Background.jsx";
import Menu from "../components/Menu.jsx";
import DealCalculator from "../components/calculator/DealCalculator.jsx";

export default function CalculatorPage() {
  return (
    <Background>
      <Menu />
      <DealCalculator />
    </Background>
  );
}
