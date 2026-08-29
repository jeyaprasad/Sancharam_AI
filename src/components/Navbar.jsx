import React, { useEffect, useState } from 'react';
import { Link, useLocation } from '@/lib/router-compat';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/storage/client';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: '/auth', replace: true });
  };

  const displayName =
    session?.user?.user_metadata?.full_name?.split(' ')[0] ||
    session?.user?.email?.split('@')[0] ||
    '';

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
              <Link to="/features/safety" aria-current={currentPath === '/features/safety' ? 'page' : undefined}>Kaaval (Safety)</Link>
              <Link to="/features/routing" aria-current={currentPath === '/features/routing' ? 'page' : undefined}>Oor (Routing)</Link>
              <Link to="/features/budget" aria-current={currentPath === '/features/budget' ? 'page' : undefined}>Payana Nidhi (Budget)</Link>
            </div>
          </div>

          <Link to="/features/itinerary" aria-current={currentPath === '/features/itinerary' ? 'page' : undefined}>Neram</Link>
          <Link to="/about" aria-current={currentPath === '/about' ? 'page' : undefined}>About</Link>

          {session ? (
            <span className="nav-auth">
              <button type="button" className="nav-auth-btn" onClick={handleSignOut}>
                Sign out
              </button>
            </span>
          ) : (
            <Link to="/auth" className="nav-auth-btn nav-auth-link">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
