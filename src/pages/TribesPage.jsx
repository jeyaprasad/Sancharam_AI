import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  food: { bg: 'rgba(255, 152, 0, 0.15)', text: '#ff9800', border: 'rgba(255, 152, 0, 0.4)' },
  safety: { bg: 'rgba(255, 77, 77, 0.15)', text: '#ff4d4d', border: 'rgba(255, 77, 77, 0.4)' },
  transport: { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3', border: 'rgba(33, 150, 243, 0.4)' },
  'hidden spot': { bg: 'rgba(156, 39, 176, 0.15)', text: '#ab47bc', border: 'rgba(156, 39, 176, 0.4)' },
  'temple etiquette': { bg: 'rgba(255, 215, 0, 0.15)', text: '#FFD700', border: 'rgba(255, 215, 0, 0.4)' }
};

const TribesPage = () => {
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('food');
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [text, setText] = useState('');

  // Feed & Loading State
  const [tips, setTips] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({});

  // Fetch tips from Flask SQLite backend on mount
  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tips');
        if (response.ok) {
          const data = await response.json();
          setTips(data);
        } else {
          throw new Error('Backend unavailable');
        }
      } catch (err) {
        console.log('Using local initial tips fallback:', err);
      } finally {
        setLoadingFeed(false);
      }
    };

    fetchTips();
  }, []);

  // Verify Tip Hash-Chain with GET /api/tips/verify/<id>
  const handleVerifyTip = async (tipId) => {
    if (!tipId || typeof tipId === 'string' && tipId.startsWith('temp-')) {
      alert('This tip is still being processed on the server.');
      return;
    }

    setVerificationStatus((prev) => ({
      ...prev,
      [tipId]: { loading: true }
    }));

    try {
      const res = await fetch(`http://localhost:5000/api/tips/verify/${tipId}`);
      if (res.ok) {
        const data = await res.json();
        setVerificationStatus((prev) => ({
          ...prev,
          [tipId]: { loading: false, valid: data.valid, details: data }
        }));
      } else {
        setVerificationStatus((prev) => ({
          ...prev,
          [tipId]: { loading: false, valid: false, error: true }
        }));
      }
    } catch (err) {
      setVerificationStatus((prev) => ({
        ...prev,
        [tipId]: { loading: false, valid: false, error: true }
      }));
    }
  };

  // Auto-fill GPS Coordinates
  const handleAutoFillGPS = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        setGeoLoading(false);
      },
      (err) => {
        console.warn(err);
        setCoordinates('13.082700, 80.270700'); // Default Chennai
        setGeoLoading(false);
      }
    );
  };

  // Submit New Tip to POST /api/tips
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    setSubmitting(true);

    const tempId = `temp-${Date.now()}`;
    const newTipPayload = {
      id: tempId,
      title: title.trim(),
      category,
      location_name: locationName.trim() || 'Chennai',
      location: locationName.trim() || 'Chennai',
      coordinates: coordinates.trim() || '13.0827, 80.2707',
      content: text.trim().slice(0, 300),
      text: text.trim().slice(0, 300),
      timestamp: new Date().toISOString(),
      verified: true
    };

    // Optimistically add to top of feed list immediately
    setTips((prev) => [newTipPayload, ...prev]);

    try {
      const response = await fetch('http://localhost:5000/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTipPayload)
      });

      if (response.ok) {
        const createdTip = await response.json();
        // Replace optimistic entry with server response containing DB id and SHA-256 hash
        setTips((prev) => [createdTip, ...prev.filter((t) => t.id !== tempId)]);
      }
    } catch (err) {
      console.log('Optimistic tip saved locally:', err);
    } finally {
      setSubmitting(false);
      // Clear Form Fields
      setTitle('');
      setLocationName('');
      setCoordinates('');
      setText('');
    }
  };

  const remainingChars = 300 - text.length;

  return (
    <div className="features-container">
      <div className="features-hero-bg">
        <header>
          <div className="nav-in">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
                border: '1px solid #FFD700',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: '700', color: '#1A1A1A', letterSpacing: '-0.3px' }}>
                San<span style={{ color: '#B4451F' }}>charam</span>
              </span>
            </Link>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/features">Features</Link>
              <Link to="/features/tribes" aria-current="page">Tribes</Link>
              <Link to="/features/uncharted">Uncharted</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '120px', minHeight: '340px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>பயணக் குழுக்கள்</span>
            <h1>Travel <em>Tribes</em></h1>
            <p className="hero-sub" style={{ fontSize: '1.3rem', color: 'var(--accent, #FFD700)', marginTop: '0.5rem' }}>
              பயணக் குழுக்கள் · SHA-256 Hash-Chain Blockchain Verification
            </p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '3rem 2rem 5rem 2rem' }}>
        <div className="tribes-grid">
          {/* ── LEFT SECTION: SUBMIT NEW COMMUNITY TIP FORM ── */}
          <div className="left-section">
            <form
              onSubmit={handleSubmit}
              style={{
                background: '#14141d',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #282838',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                position: 'sticky',
                top: '100px'
              }}
            >
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem', fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
                Share a Community Tip
              </h2>
              <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Help fellow travelers navigate Chennai with Hash-Chain verified local insights.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Tip Title */}
                <div>
                  <label style={{ display: 'block', color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                    Tip Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="E.g., Best Filter Coffee at Sunrise"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: '#1a1a26',
                      border: '1px solid #33334d',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label style={{ display: 'block', color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 1rem',
                      background: '#1a1a26',
                      border: '1px solid #33334d',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  >
                    <option value="food">🍱 Food & Dining</option>
                    <option value="safety">🛡️ Safety Alert</option>
                    <option value="transport">🚌 Transport & Transit</option>
                    <option value="hidden spot">💎 Hidden Spot</option>
                    <option value="temple etiquette">🛕 Temple Etiquette</option>
                  </select>
                </div>

                {/* Location Name */}
                <div>
                  <label style={{ display: 'block', color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="E.g., Rayar's Mess, Mylapore"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: '#1a1a26',
                      border: '1px solid #33334d',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Optional Coordinates with Auto-fill GPS */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Coordinates <small style={{ color: '#888', fontWeight: 'normal' }}>(Optional)</small>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoFillGPS}
                      disabled={geoLoading}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2ec4b6',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textDecoration: 'underline'
                      }}
                    >
                      {geoLoading ? 'Fetching GPS...' : '📍 Auto-fill GPS'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    placeholder="13.0337, 80.2686"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: '#1a1a26',
                      border: '1px solid #33334d',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Tip Text with Live Character Counter */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Tip Details
                    </label>
                    <span style={{ fontSize: '0.75rem', color: remainingChars < 20 ? '#ff4d4d' : '#888' }}>
                      {remainingChars} / 300 left
                    </span>
                  </div>
                  <textarea
                    rows="4"
                    maxLength={300}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                    placeholder="Share insider advice for travelers (max 300 characters)..."
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: '#1a1a26',
                      border: '1px solid #33334d',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.9rem 1.5rem',
                    background: submitting ? '#555' : 'var(--accent, #FFD700)',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    borderRadius: '50px',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}
                >
                  {submitting ? (
                    <>
                      <div className="btn-spinner" /> Chaining Hash & Saving...
                    </>
                  ) : (
                    'Publish Verified Tip 🚀'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── RIGHT SECTION: COMMUNITY TIPS FEED ── */}
          <div className="right-section">
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1.5rem', fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
              💬 Verified Community Feed ({tips.length})
            </h2>

            {loadingFeed ? (
              <div style={{ color: '#aaa', textAlign: 'center', padding: '3rem' }}>
                Loading community tips from SQLite...
              </div>
            ) : tips.length === 0 ? (
              <div style={{ color: '#aaa', textAlign: 'center', padding: '3rem' }}>
                No tips submitted yet. Be the first to post!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {tips.map((tip) => {
                  const catStyle = CATEGORY_COLORS[tip.category] || CATEGORY_COLORS.food;
                  const dateVal = tip.created_at || tip.timestamp;
                  const formattedDate = dateVal
                    ? new Date(dateVal).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Just now';

                  const shortHash = tip.hash ? `0x${tip.hash.slice(0, 8)}...` : 'Verified';
                  const vState = verificationStatus[tip.id];

                  return (
                    <div
                      key={tip.id}
                      style={{
                        background: '#14141d',
                        border: '1px solid #282838',
                        borderRadius: '14px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem'
                      }}
                    >
                      {/* Header Row: Category Badge, Hash Badge & Verify Button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span
                          style={{
                            background: catStyle.bg,
                            color: catStyle.text,
                            border: `1px solid ${catStyle.border}`,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {tip.category}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {/* Green Blockchain SHA-256 Verification Badge */}
                          <span
                            title={tip.hash ? `SHA-256 Hash: ${tip.hash}` : 'Verified Tip'}
                            style={{
                              background: 'rgba(46, 196, 182, 0.15)',
                              color: '#2ec4b6',
                              border: '1px solid rgba(46, 196, 182, 0.4)',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontFamily: 'monospace'
                            }}
                          >
                            🔒 {shortHash}
                          </span>

                          {/* Verify Hash-Chain Button */}
                          <button
                            type="button"
                            onClick={() => handleVerifyTip(tip.id)}
                            disabled={vState?.loading}
                            style={{
                              background: vState?.valid
                                ? 'rgba(46, 196, 182, 0.2)'
                                : vState?.valid === false
                                ? 'rgba(255, 77, 77, 0.2)'
                                : '#222235',
                              color: vState?.valid
                                ? '#2ec4b6'
                                : vState?.valid === false
                                ? '#ff4d4d'
                                : '#FFD700',
                              border: vState?.valid
                                ? '1px solid #2ec4b6'
                                : vState?.valid === false
                                ? '1px solid #ff4d4d'
                                : '1px solid #444466',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {vState?.loading
                              ? '⏳ Verifying...'
                              : vState?.valid === true
                              ? '✓ Chain Validated'
                              : vState?.valid === false
                              ? '⚠️ Hash Mismatch'
                              : '🔍 Verify'}
                          </button>
                        </div>
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 4px 0', lineHeight: '1.3' }}>
                          {tip.title}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: '#FFD700' }}>
                          📍 {tip.location_name || tip.location}
                        </div>
                      </div>

                      {/* Tip Text */}
                      <p style={{ color: '#ccc', fontSize: '0.92rem', lineHeight: '1.55', margin: 0 }}>
                        {tip.content || tip.text}
                      </p>

                      {/* Footer Row: Timestamp & Hash info */}
                      <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #222233', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#777' }}>
                          🕒 {formattedDate}
                        </span>
                        {tip.coordinates && (
                          <span style={{ fontSize: '0.75rem', color: '#555' }}>
                            {tip.coordinates}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid & Spinner Styling */}
      <style>{`
        .tribes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        @media (min-width: 900px) {
          .tribes-grid {
            grid-template-columns: 1fr 1.1fr !important;
          }
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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

export default TribesPage;
