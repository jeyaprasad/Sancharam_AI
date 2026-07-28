import React from 'react';
import CurrencyWidget from '@/components/CurrencyWidget';
import { Link } from 'react-router-dom';

const BudgetTrackerPage = () => {
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
              <Link to="/features/itinerary">Planner</Link>
              <Link to="/features/budget" aria-current="page">Budget</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '100px', minHeight: 'unset', paddingBottom: '2rem' }}>
          <div className="rv in">
            <h1>Budget <em>Tracker</em></h1>
            <p className="hero-sub" style={{ marginBottom: '2rem' }}>Keep track of your spending while in Chennai.</p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ marginTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <CurrencyWidget />
        </div>
        
        <div style={{ background: 'var(--bg-card, #111)', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
          <h2>Expense Logger</h2>
          <p style={{ color: '#aaa', marginTop: '1rem' }}>
            Add your daily expenses in INR to see total spending.
          </p>
          <div style={{ height: '200px', border: '1px dashed #444', borderRadius: '8px', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            Expense List Placeholder
          </div>
        </div>
      </div>
      
      <div className="wrap">
        <footer>
          <Link to="/" className="logo">San<span>charam</span></Link>
          <div className="f-links">
            <Link to="/features/safety">Safety</Link>
            <Link to="/features/routing">Routing</Link>
            <Link to="/features/itinerary">Planner</Link>
            <Link to="/features/budget">Budget</Link>
            <Link to="/features/uncharted">Uncharted</Link>
          </div>
          <small>© 2026 Sancharam · Chennai</small>
        </footer>
      </div>
    </div>
  );
};

export default BudgetTrackerPage;
