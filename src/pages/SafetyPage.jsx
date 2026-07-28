import React from 'react';
import { Link } from 'react-router-dom';

const SafetyPage = () => {
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
              <Link to="/features/safety" aria-current="page">Safety</Link>
              <Link to="/features/itinerary">Planner</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '120px', minHeight: '400px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>பாதுகாப்பு</span>
            <h1>Safety & <em>Sentinel Trails</em></h1>
            <p className="hero-sub" style={{ fontSize: '1.4rem', color: 'var(--accent, #FFD700)', marginTop: '0.5rem' }}>
              பாதுகாப்பு மண்டலம் · Real-Time Crime & Accident Intelligence
            </p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '4rem 2rem' }}>
        <p style={{ color: '#ccc', fontSize: '1.1rem' }}>
          Welcome to the Sancharam Safety dashboard. Here you can monitor police-verified crime zones, accident blackspots, and live risk scores across Chennai.
        </p>
      </div>

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

export default SafetyPage;
