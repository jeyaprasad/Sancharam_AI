import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Features from '@/pages/Features';
import SafetyPage from '@/pages/SafetyPage';
import ItineraryPage from '@/pages/ItineraryPage';
import UnchartedPage from '@/pages/UnchartedPage';
import GuardianPage from '@/pages/GuardianPage';
import TribesPage from '@/pages/TribesPage';
import BudgetTrackerPage from '@/pages/BudgetTrackerPage';
import { fetchRiskZones } from '@/services/api';
import useAppStore from '@/store/useAppStore';

function App() {
  const setRiskZones = useAppStore((state) => state.setRiskZones);

  useEffect(() => {
    // Fetch initial data for the application
    const loadData = async () => {
      const zones = await fetchRiskZones();
      setRiskZones(zones);
      console.log("Loaded risk zones into global store:", zones);
    };
    
    loadData();
  }, [setRiskZones]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/features/safety" element={<SafetyPage />} />
        <Route path="/features/routing" element={<UnchartedPage />} />
        <Route path="/features/itinerary" element={<ItineraryPage />} />
        <Route path="/features/budget" element={<BudgetTrackerPage />} />
        <Route path="/features/blockchain" element={<GuardianPage />} />
        <Route path="/features/uncharted" element={<UnchartedPage />} />
        <Route path="/features/tribes" element={<TribesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
