import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useAppStore from '@/store/useAppStore';

const GuardianPage = () => {
  const userLocation = useAppStore((state) => state.userLocation);
  const setUserLocation = useAppStore((state) => state.setUserLocation);

  // Section 1: Guardian Mode State
  const [isGuardianActive, setIsGuardianActive] = useState(false);
  const watchIdRef = useRef(null);
  const lastSavedTimeRef = useRef(0);

  // Section 2: Live Risk Indicator State
  const [riskData, setRiskData] = useState({
    score: 15,
    risk_level: 'Safe',
    hour: new Date().getHours(),
    nearby_zones_count: 0,
    nearest_zones: ['Koyambedu Bus Terminus', 'Anna Nagar', 'Kathipara']
  });
  const [lastRiskFetched, setLastRiskFetched] = useState(null);

  // Section 3: Emergency Contact State
  const [emergencyPhone, setEmergencyPhone] = useState(() => {
    return localStorage.getItem('guardian_emergency_phone') || '+919876543210';
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // ── 1. GEOLOCATION WATCHER (10-second updates) ──
  useEffect(() => {
    if (isGuardianActive) {
      if ('geolocation' in navigator) {
        // Initial immediate location update
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(loc);
            lastSavedTimeRef.current = Date.now();
          },
          (err) => console.warn('Geolocation initial fetch error:', err),
          { enableHighAccuracy: true }
        );

        // Continuous watch position
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const now = Date.now();
            // Throttle to save to Zustand store every 10 seconds
            if (now - lastSavedTimeRef.current >= 10000 || !userLocation) {
              lastSavedTimeRef.current = now;
              setUserLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              });
            }
          },
          (err) => {
            console.warn('Geolocation watch error:', err);
            // Fallback default coordinates for Chennai if GPS fails
            if (!userLocation) {
              setUserLocation({ lat: 13.0695, lng: 80.1966 });
            }
          },
          { enableHighAccuracy: true }
        );
      } else {
        // Fallback default location if geolocation unsupported
        setUserLocation({ lat: 13.0695, lng: 80.1966 });
      }
    } else {
      // Turn OFF tracking & clear watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isGuardianActive, setUserLocation]);

  // ── 2. LIVE RISK SCORE POLLING (Every 30 seconds) ──
  useEffect(() => {
    const fetchRiskScore = async () => {
      const lat = userLocation?.lat ?? 13.0695;
      const lng = userLocation?.lng ?? 80.1966;
      const currentHour = new Date().getHours();

      try {
        const response = await fetch(
          `http://localhost:5000/api/risk-score?lat=${lat}&lng=${lng}&hour=${currentHour}`
        );
        if (response.ok) {
          const data = await response.json();
          setRiskData(data);
        } else {
          throw new Error('Risk API error');
        }
      } catch (err) {
        // Mock score fallback if backend isn't running
        setRiskData({
          score: 25,
          risk_level: 'Low',
          hour: currentHour,
          nearby_zones_count: 1,
          nearest_zones: ['Koyambedu Bus Terminus', 'Anna Nagar', 'Kathipara']
        });
      } finally {
        setLastRiskFetched(new Date().toLocaleTimeString());
      }
    };

    // Initial fetch
    fetchRiskScore();

    // Poll every 30 seconds
    const interval = setInterval(fetchRiskScore, 30000);
    return () => clearInterval(interval);
  }, [userLocation]);

  // ── 3. SAVE EMERGENCY PHONE TO LOCALSTORAGE ──
  const handleSavePhone = (e) => {
    e.preventDefault();
    localStorage.setItem('guardian_emergency_phone', emergencyPhone);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // ── 4. SHARE LOCATION VIA WHATSAPP & CLIPBOARD ──
  const handleShareLocation = () => {
    const lat = userLocation?.lat ?? 13.0695;
    const lng = userLocation?.lng ?? 80.1966;
    const coordsStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    // Copy to Clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(coordsStr);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    }

    // Clean phone number (strip spaces/dashes)
    const cleanPhone = emergencyPhone.replace(/[^\d+]/g, '');
    const message = `EMERGENCY ALERT! I need urgent assistance. My live GPS location: https://maps.google.com/?q=${lat},${lng} (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}).`;

    // Open WhatsApp scheme
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Compute Coloured Ring Properties
  const score = riskData?.score ?? 0;
  let ringColor = '#2ec4b6'; // Green below 30
  if (score > 60) {
    ringColor = '#ff4d4d'; // Red above 60
  } else if (score >= 30) {
    ringColor = '#ffd700'; // Yellow 30-60
  }

  // SVG Ring Calculation
  const strokeWidth = 12;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (Math.min(100, score) / 100) * circumference;

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
              <Link to="/features/safety">Safety</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '120px', minHeight: '340px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>பாதுகாவலன்</span>
            <h1>Guardian <em>Shield</em></h1>
            <p className="hero-sub" style={{ fontSize: '1.3rem', color: 'var(--accent, #FFD700)', marginTop: '0.5rem' }}>
              பாதுகாவலன் · Live Location Watcher & Emergency Response
            </p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '3rem 2rem 5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* ── SECTION 1: GUARDIAN MODE TOGGLE ── */}
          <div
            style={{
              background: '#14141d',
              border: isGuardianActive ? '2px solid #2ec4b6' : '1px solid #282838',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: isGuardianActive ? '0 0 25px rgba(46, 196, 182, 0.2)' : '0 8px 30px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: 0, fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
                  🛡️ Guardian Mode
                </h3>
                <span
                  style={{
                    background: isGuardianActive ? 'rgba(46, 196, 182, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: isGuardianActive ? '#2ec4b6' : '#888',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {isGuardianActive ? 'ACTIVE WATCH' : 'DISARMED'}
                </span>
              </div>

              <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                When Guardian Mode is turned ON, Sancharam monitors your live location in the background, updating your safety coordinates every 10 seconds.
              </p>

              {/* Large Toggle Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsGuardianActive(!isGuardianActive)}
                  style={{
                    width: '80px',
                    height: '42px',
                    borderRadius: '50px',
                    background: isGuardianActive ? '#2ec4b6' : '#333345',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease',
                    boxShadow: isGuardianActive ? '0 0 15px rgba(46, 196, 182, 0.5)' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '4px',
                      left: isGuardianActive ? '42px' : '4px',
                      transition: 'left 0.3s ease',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                    }}
                  />
                </button>
                <span style={{ color: isGuardianActive ? '#fff' : '#aaa', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {isGuardianActive ? 'Protection Enabled' : 'Enable Guardian'}
                </span>
              </div>
            </div>

            {/* Current Coordinates Box */}
            <div style={{ background: '#1a1a28', padding: '1rem', borderRadius: '10px', fontSize: '0.85rem', color: '#ccc' }}>
              <strong style={{ color: '#FFD700' }}>GPS Coordinates:</strong>{' '}
              {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Waiting for GPS signal...'}
            </div>
          </div>

          {/* ── SECTION 2: LIVE RISK INDICATOR ── */}
          <div
            style={{
              background: '#14141d',
              border: '1px solid #282838',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justify: 'space-between',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: 0, fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
                  ⚡ Live Risk Indicator
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#777' }}>
                  Auto-updates 30s {lastRiskFetched && `(${lastRiskFetched})`}
                </span>
              </div>

              {/* Coloured Ring SVG */}
              <div style={{ position: 'relative', width: '180px', height: '180px', margin: '1.5rem auto' }}>
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Track Circle */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="#222233"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Active Progress Circle */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justify: 'center'
                  }}
                >
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: ringColor, lineHeight: 1 }}>
                    {score}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
                    {riskData?.risk_level ?? 'Safe'} Risk
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#ccc', textAlign: 'center' }}>
                <strong>Nearest Focus:</strong> {riskData?.nearest_zones?.[0] ?? 'Chennai Center'}
              </div>
            </div>
          </div>

          {/* ── SECTION 3: EMERGENCY CONTACTS PANEL ── */}
          <div
            style={{
              background: '#14141d',
              border: '1px solid #282838',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
                🚨 Emergency SOS Panel
              </h3>

              {/* Editable Emergency Contact Phone Form */}
              <form onSubmit={handleSavePhone} style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                  Saved Emergency Contact Phone
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    required
                    placeholder="+91 98765 43210"
                    style={{
                      flex: 1,
                      padding: '0.7rem 0.9rem',
                      background: '#1a1a26',
                      border: '1px solid #33334d',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.7rem 1rem',
                      background: '#33334d',
                      color: '#FFD700',
                      border: '1px solid #555577',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                </div>
                {savedSuccess && (
                  <span style={{ color: '#2ec4b6', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    ✓ Contact saved to localStorage!
                  </span>
                )}
              </form>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Hardcoded Call 100 Button */}
                <a
                  href="tel:100"
                  style={{
                    padding: '1rem',
                    background: '#ff4d4d',
                    color: '#fff',
                    textAlign: 'center',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 15px rgba(255, 77, 77, 0.4)',
                    display: 'block'
                  }}
                >
                  📞 Call Police Control (100)
                </a>

                {/* Share My Location via WhatsApp & Copy Clipboard */}
                <button
                  type="button"
                  onClick={handleShareLocation}
                  style={{
                    padding: '1rem',
                    background: '#25D366',
                    color: '#000',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
                  }}
                >
                  💬 Share Live Location on WhatsApp
                </button>

                {copiedSuccess && (
                  <span style={{ color: '#2ec4b6', fontSize: '0.8rem', textAlign: 'center', display: 'block' }}>
                    ✓ Coordinates copied to clipboard & WhatsApp opened!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
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
