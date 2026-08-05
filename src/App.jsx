import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import CalculatorPage from "./pages/CalculatorPage.jsx";
import BuyersPage from "./pages/BuyersPage.jsx";

// Central route table. Add new pages here as the site grows.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/buyers" element={<BuyersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
