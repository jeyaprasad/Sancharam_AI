import React from 'react';
import { Link } from 'react-router-dom';

const UnchartedPage = () => {
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
              <Link to="/features/uncharted" aria-current="page">Uncharted</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '120px', minHeight: '400px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>அறியப்படாத இடங்கள்</span>
            <h1>Uncharted <em>Places</em></h1>
            <p className="hero-sub" style={{ fontSize: '1.4rem', color: 'var(--accent, #FFD700)', marginTop: '0.5rem' }}>
              அறியப்படாத இடங்கள் · Secret Corners & Hidden Cultural Heritage
            </p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '4rem 2rem' }}>
        <p style={{ color: '#ccc', fontSize: '1.1rem' }}>
          Explore secret alleys, hidden temples, and off-beat food hubs across Chennai that standard travel maps miss.
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

export default UnchartedPage;
