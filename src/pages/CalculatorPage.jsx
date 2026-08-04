import Background from "../components/Background.jsx";
import Nav from "../components/Nav.jsx";
import DealCalculator from "../components/calculator/DealCalculator.jsx";

export default function CalculatorPage() {
  return (
    <Background>
      <Nav />
      <DealCalculator />
    </Background>
  );
}
