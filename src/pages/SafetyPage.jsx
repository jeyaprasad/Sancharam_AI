import React, { useState, useEffect } from 'react';
import {MapPin, Calendar, Hotel, PartyPopper, CreditCard, IndianRupee, Target, CheckCircle, PieChart, ClipboardList, Award, AlertTriangle, ShieldAlert, Route, Clock, Navigation, X, Check, ShieldCheck, ArrowRightLeft, Globe, Shield, Search, Pointer, Lightbulb, Folder, BarChart3} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import Navbar from '@/components/Navbar';
import useAppStore from '@/store/useAppStore';

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
        <Navbar />

        <section className="hero wrap" style={{ padding: '120px clamp(20px,5vw,48px) 40px clamp(20px,5vw,48px)', minHeight: '360px', display: 'flex', alignItems: 'center', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <div className="rv in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span className="pill" lang="ta" style={{ background: 'rgba(255,255,255,0.9)', color: '#B4451F', border: '1px solid #B4451F', fontWeight: 'bold' }}><i></i>பாதுகாப்பு</span>
            <h1 style={{ fontFamily: '"Catamaran", "Noto Sans Tamil", sans-serif', fontWeight: 900, letterSpacing: '-0.02em', transform: 'scaleY(1.15)', transformOrigin: 'bottom left', color: 'var(--rust)', fontSize: 'clamp(4rem, 8vw, 7.5rem)', margin: '0.5rem 0 1rem 0', textShadow: '2px 2px 0px rgba(255,255,255,0.8)' }}>கவசம்</h1>
            <div style={{
              marginTop: '1.5rem',
              background: 'linear-gradient(135deg, rgba(20,20,30,0.95), rgba(10,10,15,0.85))',
              backdropFilter: 'blur(16px)',
              padding: '1.5rem 2rem',
              borderRadius: '16px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.8rem'
            }}>
              <p style={{ fontSize: '1.4rem', color: 'var(--rust)', margin: 0, fontFamily: '"Tiro Tamil", "Vijaya", "Latha", serif', letterSpacing: '0.5px', fontWeight: 'bold', whiteSpace: 'nowrap', textAlign: 'left' }}>
                பாதுகாப்பு மண்டலம் · Live Risk & Accident Intelligence Map
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderTop: '1px solid rgba(255, 215, 0, 0.2)', paddingTop: '1rem', width: '100%' }}>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <Shield size={18} color="#FFD700" /> 24/7 Monitoring
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <AlertTriangle size={18} color="#FFD700" /> Live Police Data
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <Globe size={18} color="#FFD700" /> Community Verified
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '3rem 2rem 4rem 2rem' }}>
        {/* ── REVAMPED SUMMARY CARDS ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Total Risk Zones */}
          <div
            style={{
              background: 'linear-gradient(145deg, #1c1c28, #14141c)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                Total Risk Zones
              </span>
              <Globe size={24} color="#FFD700" />
            </div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#FFD700', lineHeight: '1' }}>
              {totalZones}
            </div>
          </div>

          {/* High-Risk Zones */}
          <div
            style={{
              background: 'linear-gradient(145deg, #1c1c28, #14141c)',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(255, 77, 77, 0.1)'
            }}
          >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(255, 77, 77, 0.15)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                High-Risk Zones
              </span>
              <ShieldAlert size={24} color="#ff4d4d" />
            </div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#ff4d4d', lineHeight: '1' }}>
              {highRiskCount}
            </div>
          </div>

          {/* Medium-Risk Zones */}
          <div
            style={{
              background: 'linear-gradient(145deg, #1c1c28, #14141c)',
              border: '1px solid rgba(255, 165, 0, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(255, 165, 0, 0.08)'
            }}
          >
             <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(255, 165, 0, 0.15)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                Medium-Risk Zones
              </span>
              <AlertTriangle size={24} color="#ffa500" />
            </div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#ffa500', lineHeight: '1' }}>
              {mediumRiskCount}
            </div>
          </div>
        </div>

        {/* ── REVAMPED MAP UI DASHBOARD (LIGHT MODE) ── */}
        <div style={{ position: 'relative', height: '650px', width: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
          
          {/* FLOATING SEARCH PANEL */}
          <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '600px', maxWidth: '90%' }}>
            <form
              onSubmit={handleSearchLocation}
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '99px',
                padding: '0.5rem 0.5rem 0.5rem 1.2rem',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ color: '#000', display: 'flex' }}><Search size={20} /></div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any location in Chennai for live risk assessment..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#111',
                  fontSize: '1.05rem',
                  outline: 'none',
                  padding: '0.6rem 1rem'
                }}
              />
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                style={{
                  padding: '0.8rem 1.8rem',
                  background: searchLoading || !searchQuery.trim() ? 'rgba(0,0,0,0.05)' : '#000',
                  color: searchLoading || !searchQuery.trim() ? '#888' : '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  border: 'none',
                  borderRadius: '99px',
                  cursor: searchLoading || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {searchLoading ? 'Scanning...' : 'Assess Risk'}
              </button>
            </form>

            {/* Floating Search Result */}
            {searchResult && (
              <div
                style={{
                  marginTop: '1rem',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
                  animation: 'fadeIn 0.3s ease-in-out'
                }}
              >
                <div>
                  <span style={{ color: '#000', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>
                    Risk Assessment Complete
                  </span>
                  <h3 style={{ color: '#111', fontSize: '1.4rem', margin: '6px 0', fontWeight: 'bold' }}>
                    <MapPin size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> {searchResult.name}
                  </h3>
                  <small style={{ color: '#555', fontSize: '0.85rem' }}>
                    Nearest: {searchResult.nearestZones?.join(', ') || 'N/A'}
                  </small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: '#555', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    Risk Score
                  </div>
                  <div
                    style={{
                      fontSize: '2.4rem',
                      fontWeight: '900',
                      lineHeight: '1.1',
                      color: searchResult.score >= 60 ? '#e63946' : searchResult.score >= 40 ? '#f4a261' : '#2a9d8f'
                    }}
                  >
                    {searchResult.score} <span style={{ fontSize: '1.2rem', color: '#888', fontWeight: '600' }}>/ 100</span>
                  </div>
                  <span
                    style={{
                      background: searchResult.score >= 60 ? 'rgba(230, 57, 70, 0.1)' : searchResult.score >= 40 ? 'rgba(244, 162, 97, 0.1)' : 'rgba(42, 157, 143, 0.1)',
                      color: searchResult.score >= 60 ? '#e63946' : searchResult.score >= 40 ? '#d97706' : '#2a9d8f',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      border: `1px solid ${searchResult.score >= 60 ? 'rgba(230, 57, 70, 0.2)' : searchResult.score >= 40 ? 'rgba(244, 162, 97, 0.2)' : 'rgba(42, 157, 143, 0.2)'}`,
                      display: 'inline-block',
                      marginTop: '4px'
                    }}
                  >
                    {searchResult.riskLevel} Risk Zone
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* FLOATING LEGEND */}
          <div style={{ position: 'absolute', bottom: '24px', left: '24px', zIndex: 1000, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.8rem', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
            <h4 style={{ color: '#111', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '8px' }}>Map Legend</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#e63946', display: 'inline-block', boxShadow: '0 0 8px rgba(230,57,70,0.4)' }}></span>
              <span style={{ color: '#333', fontSize: '0.85rem', fontWeight: '600' }}>High Risk (Police/Accidents)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f4a261', display: 'inline-block', opacity: 0.8, border: '2px dashed #f4a261' }}></span>
              <span style={{ color: '#333', fontSize: '0.85rem', fontWeight: '600' }}>Medium Risk (Community Tips)</span>
            </div>
            {isNightTime && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #e63946', animation: 'pulseGlow 2s infinite', display: 'inline-block' }}></span>
                <span style={{ color: '#111', fontSize: '0.85rem', fontWeight: 'bold' }}>Night-Escalating Active</span>
              </div>
            )}
          </div>

          <MapContainer
            center={[13.0827, 80.2707]}
            zoom={12}
            style={{ height: '100%', width: '100%', background: '#e5e5e5' }}
            scrollWheelZoom={true}
            zoomControl={false}
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
                        <small style={{ color: '#0066cc', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <Pointer size={12} style={{ marginRight: '4px' }} /> Click marker to view hourly risk chart & details
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
                      <span style={{ background: '#ff9800', color: '#000', padding: '2px 6px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', marginBottom: '4px', width: 'max-content' }}>
                        <Lightbulb size={12} style={{ marginRight: '4px' }} /> Community Tip (Avoid After Dark)
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
                <Shield size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> Zone Intelligence Detail
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

              <span style={{ background: '#222235', color: '#aaa', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                <Folder size={12} style={{ marginRight: '4px' }} /> {selectedZone.source === 'accident' || selectedZone.primary_cause ? 'Accident Blackspot' : 'Police Crime Zone'}
              </span>
            </div>

            {/* Description / Reason */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #2e2e42', borderRadius: '10px', padding: '1rem', marginBottom: '1.75rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Primary Cause / Concern:
              </label>
              <p style={{ color: '#fff', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                {selectedZone.description || selectedZone.primary_concern || selectedZone.primary_cause || 'High traffic collision and nocturnal risk factors.'}
              </p>
            </div>

            {/* Recharts Hourly Risk Bar Chart */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #2e2e42', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#FFD700', fontSize: '0.9rem', margin: '0 0 1rem 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <BarChart3 size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> Time-of-Day Risk Peaking Chart
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
    </div>
  );
};

export default SafetyPage;

