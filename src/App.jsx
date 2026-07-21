import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Features from './pages/Features';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        {/* Mock other routes */}
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
