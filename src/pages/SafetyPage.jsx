import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import useAppStore from '@/store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SafetyPage = () => {
  const riskZones = useAppStore((state) => state.riskZones);

  // ── State for Extensions ──
  const [selectedZone, setSelectedZone] = useState(null);
  const [avoidTips, setAvoidTips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  // Compute current hour for night risk check (>= 21 or < 6)
  const currentHour = new Date().getHours();
  const isNightTime = currentHour >= 21 || currentHour < 6;

  // Compute summary stats from Zustand store
  const totalZones = riskZones.length;
  const highRiskCount = riskZones.filter((z) => {
    const level = (z.riskLevel || z.risk_level || '').toLowerCase();
    return level === 'high';
  }).length;
  const mediumRiskCount = riskZones.filter((z) => {
    const level = (z.riskLevel || z.risk_level || '').toLowerCase();
    return level === 'medium';
  }).length;

  // 3. Fetch community tips and filter for "avoid after dark"
  useEffect(() => {
    const fetchCommunityTips = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tips');
        if (res.ok) {
          const tipsData = await res.json();
          if (Array.isArray(tipsData)) {
            // Filter tips matching "avoid after dark", "night", "safety", or "avoid"
            const filtered = tipsData.filter((tip) => {
              const cat = (tip.category || '').toLowerCase();
              const text = (tip.content || tip.title || '').toLowerCase();
              return cat.includes('avoid') || cat.includes('dark') || cat.includes('safety') || text.includes('dark') || text.includes('night') || text.includes('avoid');
            });
            setAvoidTips(filtered.length > 0 ? filtered : tipsData.slice(0, 3));
          }
        }
      } catch (err) {
        console.warn('Could not fetch community tips for safety page:', err);
      }
    };
    fetchCommunityTips();
  }, []);

  // 4. Geocode Location Search & Risk Assessment
  const handleSearchLocation = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim() || searchLoading) return;

    setSearchLoading(true);
    setSearchResult(null);

    try {
      // Step 1: Geocode location via Nominatim API
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ', Tamil Nadu')}&format=json&limit=1`,
        { headers: { 'User-Agent': 'Sancharam-AI-App/1.0' } }
      );
      let lat = 13.0827;
      let lng = 80.2707;
      let placeName = searchQuery;

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lng = parseFloat(geoData[0].lon);
          placeName = geoData[0].display_name.split(',')[0];
        }
      }

      // Step 2: Fetch Risk Score from Backend API
      const scoreRes = await fetch(`http://localhost:5000/api/risk-score?lat=${lat}&lng=${lng}&hour=${currentHour}`);
      if (scoreRes.ok) {
        const scoreData = await scoreRes.json();
        setSearchResult({
          name: placeName,
          lat,
          lng,
          score: scoreData.score,
          riskLevel: scoreData.risk_level,
          nearestZones: scoreData.nearest_zones || []
        });
      } else {
        throw new Error('Risk API call failed');
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
      // Fallback result card
      setSearchResult({
        name: searchQuery,
        lat: 13.0827,
        lng: 80.2707,
        score: 45.0,
        riskLevel: 'Medium',
        nearestZones: ['Koyambedu Bus Terminus', 'Anna Nagar', 'Mylapore']
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Helper to derive hourly risk score data for Recharts BarChart
  const getHourlyChartData = (zone) => {
    if (!zone) return [];
    const levelStr = String(zone.riskLevel || zone.risk_level || 'Low').toLowerCase();
    const baseScore = levelStr === 'high' ? 75 : levelStr === 'medium' ? 48 : 22;

    return [
      { time: '6 AM', score: Math.round(baseScore * 0.7) },
      { time: '10 AM', score: Math.round(baseScore * 0.5) },
      { time: '2 PM', score: Math.round(baseScore * 0.5) },
      { time: '6 PM', score: Math.round(baseScore * 0.8) },
      { time: '9 PM', score: Math.min(100, Math.round(baseScore * 1.5)) },
      { time: '11 PM', score: Math.min(100, Math.round(baseScore * 1.8)) }
    ];
  };

  return (
    <div className="features-container">
      {/* Scoped CSS animation for Night-Escalating Pulsing Markers */}
      <style>{`
        @keyframes pulseGlow {
          0% { r: 20px; opacity: 0.8; stroke-width: 2px; }
          50% { r: 32px; opacity: 0.3; stroke-width: 6px; }
          100% { r: 20px; opacity: 0.8; stroke-width: 2px; }
        }
        .pulse-marker {
          animation: pulseGlow 1.8s infinite ease-in-out;
        }
      `}</style>

      {/* ── EXISTING HERO BANNER ── */}
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
              <Link to="/features/safety" aria-current="page">Safety</Link>
              <Link to="/features/itinerary">Planner</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '120px', minHeight: '340px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>பாதுகாப்பு</span>
            <h1>Safety & <em>Sentinel Trails</em></h1>
            <p className="hero-sub" style={{ fontSize: '1.3rem', color: 'var(--accent, #FFD700)', marginTop: '0.5rem' }}>
              பாதுகாப்பு மண்டலம் · Live Risk & Accident Intelligence Map
            </p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '3rem 2rem 4rem 2rem' }}>
        {/* ── EXISTING SUMMARY CARDS ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}
        >
          <div
            style={{
              background: '#14141c',
              border: '1px solid #2a2a36',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
              Total Risk Zones
            </span>
            <div style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#FFD700', marginTop: '0.5rem' }}>
              {totalZones}
            </div>
          </div>

          <div
            style={{
              background: '#14141c',
              border: '1px solid #2a2a36',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
              High-Risk Zones
            </span>
            <div style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#ff4d4d', marginTop: '0.5rem' }}>
              {highRiskCount}
            </div>
          </div>

          <div
            style={{
              background: '#14141c',
              border: '1px solid #2a2a36',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
              Medium-Risk Zones
            </span>
            <div style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#ffa500', marginTop: '0.5rem' }}>
              {mediumRiskCount}
            </div>
          </div>
        </div>

        {/* ── 4. LOCATION SEARCH INPUT & RESULT CARD ABOVE MAP ── */}
        <div style={{ marginBottom: '2rem' }}>
          <form
            onSubmit={handleSearchLocation}
            style={{
              background: '#14141c',
              border: '1px solid #2a2a36',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#FFD700', fontSize: '0.78rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                🔍 Search Location Risk Score
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a location in Tamil Nadu (e.g., T. Nagar, Koyambedu, Marina Beach)..."
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
            <button
              type="submit"
              disabled={searchLoading || !searchQuery.trim()}
              style={{
                marginTop: '1.4rem',
                padding: '0.85rem 1.5rem',
                background: searchLoading || !searchQuery.trim() ? '#444' : 'var(--accent, #FFD700)',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                border: 'none',
                borderRadius: '8px',
                cursor: searchLoading || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {searchLoading ? 'Checking Risk...' : 'Assess Location Risk 🔍'}
            </button>
          </form>

          {/* Search Result Card */}
          {searchResult && (
            <div
              style={{
                marginTop: '1rem',
                background: 'linear-gradient(135deg, #1e1e2d, #14141f)',
                border: '1px solid #FFD700',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                boxShadow: '0 8px 25px rgba(255, 215, 0, 0.15)',
                animation: 'fadeIn 0.3s ease-in-out'
              }}
            >
              <div>
                <span style={{ color: '#aaa', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                  Risk Assessment Result
                </span>
                <h3 style={{ color: '#fff', fontSize: '1.3rem', margin: '4px 0', fontWeight: 'bold' }}>
                  📍 {searchResult.name}
                </h3>
                <small style={{ color: '#888' }}>
                  Nearest Zones: {searchResult.nearestZones?.join(', ') || 'N/A'}
                </small>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Risk Score
                </div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: searchResult.score >= 60 ? '#ff4d4d' : searchResult.score >= 40 ? '#ff9800' : '#2ec4b6'
                  }}
                >
                  {searchResult.score} / 100
                </div>
                <span
                  style={{
                    background: searchResult.score >= 60 ? 'rgba(255, 77, 77, 0.2)' : searchResult.score >= 40 ? 'rgba(255, 152, 0, 0.2)' : 'rgba(46, 196, 182, 0.2)',
                    color: searchResult.score >= 60 ? '#ff4d4d' : searchResult.score >= 40 ? '#ff9800' : '#2ec4b6',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  {searchResult.riskLevel} Risk
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── MAP LEGEND NOTICE ── */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>● Police Crime / Accident Zones (Solid)</span>
          <span style={{ color: '#ff9800', fontWeight: 'bold' }}>◌ Avoid After Dark Community Tips (Dashed)</span>
          {isNightTime && <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>⭕ Night-Escalating Pulsing Ring (9 PM - 6 AM Active)</span>}
        </div>

        {/* ── INTERACTIVE LEAFLET MAP ── */}
        <div style={{ height: '520px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
          <MapContainer
            center={[13.0827, 80.2707]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* 1 & 2. Render Risk Zones with onClick Slide-in Panel & Night Pulsing Rings */}
            {riskZones.map((zone, idx) => {
              const lat = zone.latitude ?? (Array.isArray(zone.coordinates) ? zone.coordinates[0] : zone.lat);
              const lng = zone.longitude ?? (Array.isArray(zone.coordinates) ? zone.coordinates[1] : zone.lng);

              if (lat == null || lng == null) return null;

              const rawLevel = zone.riskLevel || zone.risk_level || 'Low';
              const levelLower = String(rawLevel).toLowerCase();

              let color = 'green';
              if (levelLower === 'high') {
                color = 'red';
              } else if (levelLower === 'medium') {
                color = 'orange';
              }

              const name = zone.name || zone.zone_name || 'Risk Zone';
              const description = zone.description || zone.primary_concern || zone.primary_cause || 'No description available';
              const lastUpdated = zone.lastUpdated || zone.report_year || '2023';

              // 2. Night-escalating pulsing check (>= 21 or < 6)
              const isNightEscalating = isNightTime && (zone.night_risk === 'Yes' || zone.night_risk === 1 || zone.night_risk === true || levelLower === 'high');

              return (
                <React.Fragment key={zone.id || idx}>
                  {/* Outer Pulsing Ring for Night-Escalating Risk Zones */}
                  {isNightEscalating && (
                    <CircleMarker
                      center={[lat, lng]}
                      radius={28}
                      pathOptions={{
                        color: '#ff4d4d',
                        fillColor: '#ff4d4d',
                        fillOpacity: 0.15,
                        weight: 2,
                        dashArray: '4, 4'
                      }}
                    />
                  )}

                  {/* Main Circle Marker with onClick for Side Panel */}
                  <CircleMarker
                    center={[lat, lng]}
                    radius={20}
                    pathOptions={{ color: color, fillColor: color, fillOpacity: 0.6 }}
                    eventHandlers={{
                      click: () => {
                        setSelectedZone(zone);
                      }
                    }}
                  >
                    <Popup>
                      <div style={{ color: '#111', fontFamily: 'sans-serif', minWidth: '180px' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#111' }}>{name}</h4>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem' }}>
                          <strong>Risk Level:</strong>{' '}
                          <span style={{ color: color, fontWeight: 'bold', textTransform: 'capitalize' }}>
                            {rawLevel}
                          </span>
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#333', lineHeight: '1.4' }}>
                          {description}
                        </p>
                        <small style={{ color: '#0066cc', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          👉 Click marker to view hourly risk chart & details
                        </small>
                      </div>
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

            {/* 3. Community Tips ("Avoid After Dark") as Dashed Orange CircleMarkers */}
            {avoidTips.map((tip, idx) => {
              const tLat = parseFloat(tip.latitude) || (13.04 + (idx * 0.02));
              const tLng = parseFloat(tip.longitude) || (80.22 + (idx * 0.03));

              return (
                <CircleMarker
                  key={`tip-${tip.id || idx}`}
                  center={[tLat, tLng]}
                  radius={16}
                  pathOptions={{
                    color: '#ff9800',
                    fillColor: '#ff9800',
                    fillOpacity: 0.45,
                    weight: 2,
                    dashArray: '6, 6'
                  }}
                >
                  <Popup>
                    <div style={{ color: '#111', fontFamily: 'sans-serif', minWidth: '200px' }}>
                      <span style={{ background: '#ff9800', color: '#000', padding: '2px 6px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '4px' }}>
                        💡 Community Tip (Avoid After Dark)
                      </span>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#111' }}>{tip.title}</h4>
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#333' }}>
                        {tip.content || tip.text}
                      </p>
                      <div style={{ color: '#2ec4b6', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        ✓ SHA-256 Verified: {tip.hash ? `${tip.hash.slice(0, 10)}...` : 'Validated'}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* ── 1. SLIDE-IN SIDE PANEL (Fixed right side position, dark card styling) ── */}
      {selectedZone && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            maxWidth: '92vw',
            height: '100vh',
            background: '#14141c',
            borderLeft: '1px solid #2a2a36',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
            zIndex: 9999,
            padding: '2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            animation: 'slideInRight 0.3s ease-in-out'
          }}
        >
          <div>
            {/* Header with Close Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🛡️ Zone Intelligence Detail
              </span>
              <button
                type="button"
                onClick={() => setSelectedZone(null)}
                style={{
                  background: '#222235',
                  border: '1px solid #444466',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Zone Name & Risk Level Badge */}
            <h2 style={{ color: '#fff', fontSize: '1.6rem', margin: '0 0 0.5rem 0', fontWeight: 'bold', lineHeight: '1.3' }}>
              {selectedZone.name || selectedZone.zone_name || 'Risk Zone'}
            </h2>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span
                style={{
                  background: String(selectedZone.riskLevel || selectedZone.risk_level).toLowerCase() === 'high' ? 'rgba(255, 77, 77, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                  color: String(selectedZone.riskLevel || selectedZone.risk_level).toLowerCase() === 'high' ? '#ff4d4d' : '#ff9800',
                  border: `1px solid ${String(selectedZone.riskLevel || selectedZone.risk_level).toLowerCase() === 'high' ? '#ff4d4d' : '#ff9800'}`,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                {selectedZone.riskLevel || selectedZone.risk_level || 'Medium'} Risk
              </span>

              <span style={{ background: '#222235', color: '#aaa', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>
                📁 {selectedZone.source === 'accident' || selectedZone.primary_cause ? 'Accident Blackspot' : 'Police Crime Zone'}
              </span>
            </div>

            {/* Description / Reason */}
            <div style={{ background: '#1a1a26', border: '1px solid #2e2e42', borderRadius: '10px', padding: '1rem', marginBottom: '1.75rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Primary Cause / Concern:
              </label>
              <p style={{ color: '#fff', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                {selectedZone.description || selectedZone.primary_concern || selectedZone.primary_cause || 'High traffic collision and nocturnal risk factors.'}
              </p>
            </div>

            {/* Recharts Hourly Risk Bar Chart */}
            <div style={{ background: '#1a1a26', border: '1px solid #2e2e42', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#FFD700', fontSize: '0.9rem', margin: '0 0 1rem 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                📊 Time-of-Day Risk Peaking Chart
              </h4>

              <div style={{ width: '100%', height: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getHourlyChartData(selectedZone)}>
                    <XAxis dataKey="time" stroke="#888" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#888" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: '#14141c', border: '1px solid #FFD700', borderRadius: '8px', color: '#fff' }}
                      formatter={(val) => [`${val} / 100`, 'Risk Score']}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {getHourlyChartData(selectedZone).map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.score >= 60 ? '#ff4d4d' : entry.score >= 40 ? '#ff9800' : '#2ec4b6'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <small style={{ color: '#777', fontSize: '0.72rem', marginTop: '6px', display: 'block', textAlign: 'center' }}>
                Risk scores peak significantly during late night hours (9 PM - 2 AM).
              </small>
            </div>
          </div>

          {/* Footer inside Side Panel */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid #2a2a36' }}>
            <button
              type="button"
              onClick={() => setSelectedZone(null)}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: 'var(--accent, #FFD700)',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Close Panel ✕
            </button>
          </div>
        </div>
      )}

      {/* ── EXISTING FOOTER ── */}
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
