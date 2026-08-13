import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTamil, setShowTamil] = useState(false);

  const slides = [
    '/assets/images/chennai.jpg',
    '/assets/images/beaches.jpg',
    '/assets/images/lighthouse.jpg',
    '/assets/images/shoretemple.png',
    '/assets/images/church.jpg'
  ];

  // Slideshow Effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Language Toggle Effect
  useEffect(() => {
    const langInterval = setInterval(() => {
      setShowTamil((prev) => !prev);
    }, 4000);
    return () => clearInterval(langInterval);
  }, []);

  return (
    <div className="home-center-container" style={{ minHeight: '100vh', overflowY: 'auto', background: '#0f0f14', color: '#fff' }}>
      {/* ── TOP NAV HEADER ── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          background: 'rgba(15, 15, 20, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.9rem 2.5rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
              border: '1px solid #FFD700',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              boxShadow: '0 2px 10px rgba(255, 215, 0, 0.2)'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.7rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' }}>
            San<span style={{ color: '#FFD700' }}>charam</span>
          </span>
        </Link>

        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600', fontSize: '0.92rem' }}>Home</Link>
          <Link to="/features" style={{ color: '#ccc', textDecoration: 'none', fontWeight: '500', fontSize: '0.92rem' }}>Features</Link>
          <Link to="/features/routing" style={{ color: '#ccc', textDecoration: 'none', fontWeight: '500', fontSize: '0.92rem' }}>Routing</Link>
          <Link to="/features/safety" style={{ color: '#ccc', textDecoration: 'none', fontWeight: '500', fontSize: '0.92rem' }}>Safety</Link>
          <Link to="/features/itinerary" style={{ color: '#ccc', textDecoration: 'none', fontWeight: '500', fontSize: '0.92rem' }}>Planner</Link>
          <Link to="/features/blockchain" style={{ color: '#ccc', textDecoration: 'none', fontWeight: '500', fontSize: '0.92rem' }}>Guardian</Link>
        </nav>
      </header>

      {/* ── 1. HERO SLIDESHOW SECTION ── */}
      <div className="home-center-hero" style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {/* Background Slideshow */}
        <div className="home-center-slideshow">
          {slides.map((src, index) => (
            <img
              key={index}
              src={src}
              className={`home-slide ${index === currentSlide ? 'active' : ''}`}
              alt="Chennai landscape"
            />
          ))}
          <div className="home-center-overlay"></div>
        </div>

        {/* Hero Content */}
        <div className="home-center-content">
          <div className="home-center-badge">
            <span lang="ta">நம்ம சென்னை</span>
          </div>

          <div className="home-title-wrapper">
            <h1 className={`home-center-title lang-text ${showTamil ? 'fade-out' : 'fade-in'}`}>
              Welcome to <br /> Chennai
            </h1>
            <h1 className={`home-center-title lang-text tamil-title ${showTamil ? 'fade-in' : 'fade-out'}`}>
              சென்னைக்கு <br /> வரவேற்கிறோம்
            </h1>
          </div>

          <p className="home-center-description" style={{ maxWidth: '680px', margin: '0 auto 2rem auto', fontSize: '1.15rem', color: '#e0e0e0', lineHeight: '1.6' }}>
            Experience the vibrant soul of Tamil Nadu. From ancient Dravidian gopurams in Mylapore to the scenic ECR shores of Mahabalipuram, let Sancharam guide your travel odysseys with AI risk intelligence.
          </p>

          <div className="home-center-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/features" className="home-center-cta-btn" style={{ padding: '0.9rem 2rem', background: '#FFD700', color: '#000', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none' }}>
              Explore Features 🚀
            </Link>
            <Link to="/features/routing" style={{ padding: '0.9rem 2rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none' }}>
              Smart Routing 🛣️
            </Link>
          </div>

          {/* Scroll Down Indicator */}
          <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', color: '#aaa', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span>Scroll down to explore</span>
            <span style={{ fontSize: '1.2rem', animation: 'bounce 1.5s infinite' }}>↓</span>
          </div>
        </div>
      </div>

      {/* ── 2. FEATURES OVERVIEW SCROLLABLE SECTION ── */}
      <section style={{ padding: '5rem 2.5rem', background: '#12121a', borderTop: '1px solid #222233' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Core Capabilities
            </span>
            <h2 style={{ fontSize: '2.8rem', color: '#fff', marginTop: '0.5rem', fontFamily: "'Fraunces', Georgia, serif" }}>
              Data-Driven Travel & Safety Intelligence
            </h2>
            <p style={{ color: '#aaa', fontSize: '1.05rem', maxWidth: '600px', margin: '0.75rem auto 0 auto' }}>
              Engineered specifically for Chennai & Chengalpattu districts using NCRB crime data and TNSTA accident blackspot metrics.
            </p>
          </div>

          {/* Grid of 6 Feature Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Card 1 */}
            <Link
              to="/features/routing"
              style={{
                background: '#1a1a26',
                border: '1px solid #2a2a3d',
                borderRadius: '16px',
                padding: '2rem',
                textDecoration: 'none',
                color: '#fff',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>🛣️</div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: '#FFD700' }}>Smart Corridor Routing</h3>
                <p style={{ color: '#aaa', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  Evaluate road safety scores across 8 waypoints using OSRM geometry and time-of-day risk simulation.
                </p>
              </div>
              <span style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '1.5rem', display: 'inline-block' }}>
                Analyze Route →
              </span>
            </Link>

            {/* Card 2 */}
            <Link
              to="/features/safety"
              style={{
                background: '#1a1a26',
                border: '1px solid #2a2a3d',
                borderRadius: '16px',
                padding: '2rem',
                textDecoration: 'none',
                color: '#fff',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>🛡️</div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: '#FFD700' }}>Sentinel Safety Map</h3>
                <p style={{ color: '#aaa', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  Interactive Leaflet map with night pulse glowing rings, Recharts time-peaking charts, and location search.
                </p>
              </div>
              <span style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '1.5rem', display: 'inline-block' }}>
                Open Safety Map →
              </span>
            </Link>

            {/* Card 3 */}
            <Link
              to="/features/itinerary"
              style={{
                background: '#1a1a26',
                border: '1px solid #2a2a3d',
                borderRadius: '16px',
                padding: '2rem',
                textDecoration: 'none',
                color: '#fff',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>🗓️</div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: '#FFD700' }}>AI Itinerary Planner</h3>
                <p style={{ color: '#aaa', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  Generate custom Tamil Nadu trip itineraries integrated with local festival dates and floating AI assistant.
                </p>
              </div>
              <span style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '1.5rem', display: 'inline-block' }}>
                Plan Trip →
              </span>
            </Link>

            {/* Card 4 */}
            <Link
              to="/features/blockchain"
              style={{
                background: '#1a1a26',
                border: '1px solid #2a2a3d',
                borderRadius: '16px',
                padding: '2rem',
                textDecoration: 'none',
                color: '#fff',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>🚨</div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: '#FFD700' }}>Guardian Shield & SOS</h3>
                <p style={{ color: '#aaa', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  Background GPS location watcher with 2-second press-and-hold SOS trigger and live public share link.
                </p>
              </div>
              <span style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '1.5rem', display: 'inline-block' }}>
                Open Guardian →
              </span>
            </Link>

            {/* Card 5 */}
            <Link
              to="/features/uncharted"
              style={{
                background: '#1a1a26',
                border: '1px solid #2a2a3d',
                borderRadius: '16px',
                padding: '2rem',
                textDecoration: 'none',
                color: '#fff',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>🏛️</div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: '#FFD700' }}>Uncharted & Proof-of-Presence</h3>
                <p style={{ color: '#aaa', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  Discover 16 curated Chennai & Chengalpattu hidden spots, submit community tips with 10-min dwell verification.
                </p>
              </div>
              <span style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '1.5rem', display: 'inline-block' }}>
                Explore Hidden Gems →
              </span>
            </Link>

            {/* Card 6 */}
            <Link
              to="/features/budget"
              style={{
                background: '#1a1a26',
                border: '1px solid #2a2a3d',
                borderRadius: '16px',
                padding: '2rem',
                textDecoration: 'none',
                color: '#fff',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>💰</div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: '#FFD700' }}>Budget & Currency Tracker</h3>
                <p style={{ color: '#aaa', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  Track travel spending with live currency converter widget, category breakdown, and milestone badges.
                </p>
              </div>
              <span style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '1.5rem', display: 'inline-block' }}>
                Track Expenses →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. FOOTER ── */}
      <footer style={{ background: '#0a0a0f', borderTop: '1px solid #1a1a26', padding: '3rem 2.5rem', textAlign: 'center', color: '#777', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#FFD700', textDecoration: 'none' }}>Home</Link>
          <Link to="/features" style={{ color: '#aaa', textDecoration: 'none' }}>Features</Link>
          <Link to="/features/routing" style={{ color: '#aaa', textDecoration: 'none' }}>Routing</Link>
          <Link to="/features/safety" style={{ color: '#aaa', textDecoration: 'none' }}>Safety</Link>
          <Link to="/features/itinerary" style={{ color: '#aaa', textDecoration: 'none' }}>Itinerary</Link>
          <Link to="/features/blockchain" style={{ color: '#aaa', textDecoration: 'none' }}>Guardian</Link>
          <Link to="/features/uncharted" style={{ color: '#aaa', textDecoration: 'none' }}>Uncharted</Link>
        </div>
        <p>© 2026 Sancharam · Data-driven Travel & Risk Intelligence for Chennai & Chengalpattu</p>
      </footer>
    </div>
  );
};

export default Home;
