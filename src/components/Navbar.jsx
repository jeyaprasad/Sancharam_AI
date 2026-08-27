import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="main-header">
      <div className="nav-in">
        <Link to="/" className="logo-img-link">
          <img src="/assets/images/icon.png" alt="Sancharam Logo" className="nav-logo-img" />
        </Link>
        <nav>
          <Link to="/" aria-current={currentPath === '/' ? 'page' : undefined}>Home</Link>
          
          <div className="nav-dropdown">
            <Link 
              to="/features" 
              aria-current={currentPath.startsWith('/features') && currentPath !== '/features/itinerary' ? 'page' : undefined}
              className="dropdown-trigger"
            >
              Features
            </Link>
            <div className="dropdown-menu">
              <Link to="/features/uncharted" aria-current={currentPath === '/features/uncharted' ? 'page' : undefined}>Unarvu (Uncharted)</Link>
              <Link to="/features/itinerary" aria-current={currentPath === '/features/itinerary' ? 'page' : undefined}>Neram (Planner)</Link>
              <Link to="/features/safety" aria-current={currentPath === '/features/safety' ? 'page' : undefined}>Kaaval (Safety)</Link>
              <Link to="/features/routing" aria-current={currentPath === '/features/routing' ? 'page' : undefined}>Oor (Routing)</Link>
              <Link to="/features/budget" aria-current={currentPath === '/features/budget' ? 'page' : undefined}>Payana Nidhi (Budget)</Link>
            </div>
          </div>

          <Link to="/features/itinerary" aria-current={currentPath === '/features/itinerary' ? 'page' : undefined}>Neram (Planner)</Link>
          <Link to="/about" aria-current={currentPath === '/about' ? 'page' : undefined}>About</Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
