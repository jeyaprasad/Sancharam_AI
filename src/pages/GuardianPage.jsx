import React from 'react';
import { Link } from 'react-router-dom';

const GuardianPage = () => {
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
              <Link to="/features/blockchain" aria-current="page">Guardian</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '120px', minHeight: '400px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>பாதுகாவலன்</span>
            <h1>Guardian <em>Shield</em></h1>
            <p className="hero-sub" style={{ fontSize: '1.4rem', color: 'var(--accent, #FFD700)', marginTop: '0.5rem' }}>
              பாதுகாவலன் · Web3 Proof-of-Visit & Emergency Companion
            </p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '4rem 2rem' }}>
        <p style={{ color: '#ccc', fontSize: '1.1rem' }}>
          Guardian Shield provides round-the-clock safety tracking, emergency SOS alerts to nearby police stations, and verified blockchain rewards for heritage explorers.
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

export default GuardianPage;
