import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Landing from "./pages/Landing.jsx";
import CalculatorPage from "./pages/CalculatorPage.jsx";
import BuyersPage from "./pages/BuyersPage.jsx";
import DealsPage from "./pages/DealsPage.jsx";
import DealDetailPage from "./pages/DealDetailPage.jsx";
import TerminationNoticePage from "./pages/TerminationNoticePage.jsx";

// Central route table. Add new pages here as the site grows.
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/buyers" element={<BuyersPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deals/:id" element={<DealDetailPage />} />
          <Route path="/deals/:id/termination" element={<TerminationNoticePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
