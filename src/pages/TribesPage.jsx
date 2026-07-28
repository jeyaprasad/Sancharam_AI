import React from 'react';
import { Link } from 'react-router-dom';

const TribesPage = () => {
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
              <Link to="/features/tribes" aria-current="page">Tribes</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '120px', minHeight: '400px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>பயணக் குழுக்கள்</span>
            <h1>Travel <em>Tribes</em></h1>
            <p className="hero-sub" style={{ fontSize: '1.4rem', color: 'var(--accent, #FFD700)', marginTop: '0.5rem' }}>
              பயணக் குழுக்கள் · Community Circles & Group Exploration
            </p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '4rem 2rem' }}>
        <p style={{ color: '#ccc', fontSize: '1.1rem' }}>
          Connect with local guides, join fellow travelers on group heritage walks, and sync group itineraries across Chennai.
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

export default TribesPage;
