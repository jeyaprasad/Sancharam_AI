import React from 'react';
import CurrencyWidget from '@/components/CurrencyWidget';
import { Link } from 'react-router-dom';

const ItineraryPage = () => {
  return (
    <div className="features-container">
      <div className="features-hero-bg">
        <header>
          <div className="nav-in">
            <Link to="/" className="logo-img-link">
              <img src="/assets/images/icon.png" alt="Sancharam Logo" className="nav-logo-img" />
            </Link>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/features">Features</Link>
              <Link to="/features/itinerary" aria-current="page">Planner</Link>
              <Link to="/features/budget">Budget</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '120px', minHeight: '400px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>பயணக் திட்டம்</span>
            <h1>Itinerary <em>Planner</em></h1>
            <p className="hero-sub" style={{ fontSize: '1.4rem', color: 'var(--accent, #FFD700)', marginTop: '0.5rem' }}>
              பயணக் திட்டம் · AI Travel Odyssey
            </p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ marginTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem',
          alignItems: 'start'
        }}
        className="itinerary-grid"
        >
          {/* Left column */}
          <div style={{ background: 'var(--bg-card, #111)', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
            <h2>Plan your route</h2>
            <p style={{ color: '#aaa', marginTop: '1rem' }}>
              Select destinations, set dates, and we'll generate an optimized itinerary for you.
            </p>
            {/* Form placeholder */}
            <div style={{ height: '300px', border: '1px dashed #444', borderRadius: '8px', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Itinerary Form
            </div>
          </div>
          
          {/* Right column */}
          <div className="sidebar">
            <CurrencyWidget />
          </div>
        </div>
      </div>
      
      {/* Adding a style block to handle media queries for the grid */}
      <style>{`
        @media (min-width: 768px) {
          .itinerary-grid {
            grid-template-columns: 1fr 320px !important;
          }
        }
      `}</style>
      
      <div className="wrap">
        <footer>
          <Link to="/" className="logo">San<span>charam</span></Link>
          <div className="f-links">
            <Link to="/features/safety">Safety</Link>
            <Link to="/features/itinerary">Planner</Link>
            <Link to="/features/uncharted">Uncharted</Link>
            <Link to="/features/blockchain">Guardian</Link>
            <Link to="/features/tribes">Tribes</Link>
          </div>
          <small>© 2026 Sancharam · Chennai</small>
        </footer>
      </div>
    </div>
  );
};

export default ItineraryPage;
