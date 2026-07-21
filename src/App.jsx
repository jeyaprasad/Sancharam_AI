import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Features from '@/pages/Features';
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
        {/* Core feature routes - Currently pointing to the main Features page */}
        <Route path="/features" element={<Features />} />
        <Route path="/features/safety" element={<Features />} />
        <Route path="/features/routing" element={<Features />} />
        <Route path="/features/itinerary" element={<Features />} />
        <Route path="/features/blockchain" element={<Features />} />
        <Route path="/features/uncharted" element={<Features />} />
      </Routes>
    </Router>
  );
}

export default App;
