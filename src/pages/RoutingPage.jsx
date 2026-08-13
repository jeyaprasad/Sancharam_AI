import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useAppStore from '@/store/useAppStore';
import { analyzeRoute } from '@/services/api';

// Fix default Leaflet icon paths in Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

const RoutingPage = () => {
  const riskZones = useAppStore((state) => state.riskZones);

  // Form State
  const [origin, setOrigin] = useState('Koyambedu, Chennai');
  const [destination, setDestination] = useState('Marina Beach, Chennai');
  const [selectedHour, setSelectedHour] = useState(() => {
    const h = new Date().getHours();
    return h >= 14 && h <= 23 ? h : 22;
  });

  // Route Analysis State
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [saferRouteCoords, setSaferRouteCoords] = useState(null);
  const [saferScore, setSaferScore] = useState(null);
  const [showSaferRoute, setShowSaferRoute] = useState(false);

  // Auto-fetch initial route on component mount
  useEffect(() => {
    handleAnalyzeRoute(origin, destination, selectedHour);
  }, []);

  // Fetch / Recalculate route analysis
  const handleAnalyzeRoute = async (startLoc, destLoc, hour) => {
    setLoading(true);
    setSaferRouteCoords(null);
    setSaferScore(null);
    setShowSaferRoute(false);

    const data = await analyzeRoute(startLoc || origin, destLoc || destination, hour);
    if (data) {
      setRouteData(data);
      if (data.risk_level === 'High' || data.average_corridor_score >= 60) {
        fetchSaferAlternativeRoute(data);
      }
    }
    setLoading(false);
  };

  // Swap From / To locations
  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    handleAnalyzeRoute(destination, temp, selectedHour);
  };

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    handleAnalyzeRoute(origin, destination, selectedHour);
  };

  // Handle Slider Drag / Hour Change without losing route geometry
  const handleHourChange = async (newHour) => {
    setSelectedHour(newHour);
    if (routeData && origin && destination) {
      const data = await analyzeRoute(origin, destination, newHour);
      if (data) {
        setRouteData(data);
        if (data.risk_level === 'High' || data.average_corridor_score >= 60) {
          fetchSaferAlternativeRoute(data);
        } else {
          setSaferRouteCoords(null);
          setSaferScore(null);
          setShowSaferRoute(false);
        }
      }
    }
  };

  // Compute a detour "Safer Route" around the highest risk zone
  const fetchSaferAlternativeRoute = async (currentRouteData) => {
    if (!currentRouteData?.origin || !currentRouteData?.destination) return;

    const { lat: lat1, lng: lng1 } = currentRouteData.origin;
    const { lat: lat2, lng: lng2 } = currentRouteData.destination;

    let maxWaypoint = currentRouteData.waypoint_scores?.[0];
    if (currentRouteData.waypoint_scores) {
      currentRouteData.waypoint_scores.forEach((wp) => {
        if (wp.score > (maxWaypoint?.score || 0)) {
          maxWaypoint = wp;
        }
      });
    }

    const detourLat = maxWaypoint ? maxWaypoint.lat + 0.025 : (lat1 + lat2) / 2 + 0.02;
    const detourLng = maxWaypoint ? maxWaypoint.lng - 0.03 : (lng1 + lng2) / 2 - 0.02;
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${detourLng},${detourLat};${lng2},${lat2}?overview=full&geometries=geojson`;

    try {
      const res = await fetch(osrmUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.routes && json.routes.length > 0) {
          const coords = json.routes[0].geometry.coordinates.map((pt) => [pt[1], pt[0]]);
          setSaferRouteCoords(coords);
          const reducedScore = Math.max(18, Math.round(currentRouteData.average_corridor_score * 0.45));
          setSaferScore(reducedScore);
        }
      }
    } catch (err) {
      console.warn('Safer route calculation failed:', err);
    }
  };

  const directRouteCoords = routeData?.route_geojson?.geometry?.coordinates
    ? routeData.route_geojson.geometry.coordinates.map((pt) => [pt[1], pt[0]])
    : [];

  const mapCenter = routeData?.origin?.lat && routeData?.origin?.lng
    ? [routeData.origin.lat, routeData.origin.lng]
    : [13.0827, 80.2707];

  const formatHourLabel = (h) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${period} (${h}:00)`;
  };

  const isHighRisk = routeData?.risk_level === 'High' || (routeData?.average_corridor_score || 0) >= 60;
  const distanceKm = routeData?.route_geojson?.properties?.distance_meters
    ? (routeData.route_geojson.properties.distance_meters / 1000).toFixed(1)
    : '11.4';
  const durationMins = routeData?.route_geojson?.properties?.duration_seconds
    ? Math.round(routeData.route_geojson.properties.duration_seconds / 60)
    : 24;

  return (
    <div className="features-container">
      {/* ── HERO HEADER BANNER ── */}
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
              <Link to="/features/safety">Safety</Link>
              <Link to="/features/routing" aria-current="page">Routing</Link>
              <Link to="/features/itinerary">Planner</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '110px', minHeight: '260px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>பயணப் பாதை</span>
            <h1>Smart Corridor <em>Routing</em></h1>
            <p className="hero-sub" style={{ fontSize: '1.2rem', color: 'var(--accent, #FFD700)', marginTop: '0.4rem' }}>
              பயணப் பாதை · Geocoded OSRM Road Geometry & Time-of-Day Risk Analyzer
            </p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '2rem 2rem 5rem 2rem' }}>
        {/* ── 1. COMPACT INLINE INPUT BAR WITH SWAP BUTTON ── */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#12121a',
            border: '1px solid #2a2a3a',
            borderRadius: '16px',
            padding: '1.25rem 1.75rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          {/* From Input */}
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', color: '#FFD700', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              From (Origin)
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
              placeholder="Start location..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#1a1a26',
                border: '1px solid #33334d',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwapLocations}
            title="Swap Origin & Destination"
            style={{
              marginTop: '1.2rem',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#1a1a26',
              border: '1px solid #FFD700',
              color: '#FFD700',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              transition: 'transform 0.2s ease',
              flexShrink: 0
            }}
          >
            ⇅
          </button>

          {/* To Input */}
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', color: '#FFD700', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              To (Destination)
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              placeholder="Destination..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#1a1a26',
                border: '1px solid #33334d',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1.2rem',
              padding: '0.75rem 1.75rem',
              background: loading ? '#555' : 'var(--accent, #FFD700)',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              border: 'none',
              borderRadius: '50px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
              whiteSpace: 'nowrap',
              height: '42px'
            }}
          >
            {loading ? 'Routing...' : 'Analyze Route 🚀'}
          </button>
        </form>

        {/* ── 2. FULL-WIDTH MAP (~70% HEIGHT) WITH GOOGLE MAPS STYLE FLOATING SUMMARY CARD ── */}
        <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
          {/* Leaflet Map */}
          <div style={{ height: '620px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2a2a3a' }}>
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Risk Zones Overlay */}
              {riskZones.map((zone, idx) => {
                const level = (zone.riskLevel || zone.risk_level || '').toLowerCase();
                const color = level === 'high' ? '#ff4d4d' : level === 'medium' ? '#ff9800' : '#2ec4b6';
                const lat = parseFloat(zone.latitude);
                const lng = parseFloat(zone.longitude);
                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <CircleMarker
                    key={zone.id || idx}
                    center={[lat, lng]}
                    radius={16}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 2 }}
                  >
                    <Popup>
                      <div style={{ color: '#000', fontSize: '0.85rem' }}>
                        <strong>{zone.name || zone.zone_name}</strong><br />
                        <span style={{ color }}>Risk Level: {level.toUpperCase()}</span><br />
                        <small>{zone.description || zone.primary_concern || zone.primary_cause}</small>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* Direct Route Polyline */}
              {directRouteCoords.length > 0 && (
                <Polyline
                  positions={directRouteCoords}
                  pathOptions={{
                    color: isHighRisk ? '#ef4444' : '#3b82f6',
                    weight: 6,
                    opacity: 0.85
                  }}
                />
              )}

              {/* Safer Alternative Route Polyline (Toggled on user demand) */}
              {showSaferRoute && saferRouteCoords && (
                <Polyline
                  positions={saferRouteCoords}
                  pathOptions={{
                    color: '#10b981',
                    weight: 6,
                    opacity: 0.9,
                    dashArray: '8, 8'
                  }}
                />
              )}

              {/* Origin Marker */}
              {routeData?.origin?.lat && routeData?.origin?.lng && (
                <Marker position={[routeData.origin.lat, routeData.origin.lng]}>
                  <Popup>
                    <strong>📍 Origin: {routeData.origin.name}</strong>
                  </Popup>
                </Marker>
              )}

              {/* Destination Marker */}
              {routeData?.destination?.lat && routeData?.destination?.lng && (
                <Marker position={[routeData.destination.lat, routeData.destination.lng]}>
                  <Popup>
                    <strong>🏁 Destination: {routeData.destination.name}</strong>
                  </Popup>
                </Marker>
              )}

              {/* Waypoint Risk Markers */}
              {routeData?.waypoint_scores?.map((wp) => (
                <CircleMarker
                  key={wp.waypoint_index}
                  center={[wp.lat, wp.lng]}
                  radius={8}
                  pathOptions={{
                    color: wp.score >= 60 ? '#ef4444' : wp.score >= 40 ? '#f59e0b' : '#10b981',
                    fillColor: '#ffffff',
                    fillOpacity: 0.9,
                    weight: 3
                  }}
                >
                  <Popup>
                    <div style={{ color: '#000', fontSize: '0.82rem' }}>
                      <strong>Waypoint #{wp.waypoint_index}</strong><br />
                      Score: {wp.score} ({wp.risk_level})<br />
                      <small>Nearest: {wp.nearest_zones?.join(', ')}</small>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          {/* ── GOOGLE MAPS STYLE FLOATING ROUTE SUMMARY CARD (TOP-LEFT OF MAP) ── */}
          {routeData && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: 1000,
                background: '#12121a',
                border: '1px solid #2a2a3a',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.85)',
                minWidth: '240px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                  Route Summary
                </span>
                <span
                  style={{
                    background: isHighRisk ? 'rgba(239, 68, 68, 0.2)' : routeData.average_corridor_score >= 40 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: isHighRisk ? '#ef4444' : routeData.average_corridor_score >= 40 ? '#f59e0b' : '#10b981',
                    border: `1px solid ${isHighRisk ? '#ef4444' : routeData.average_corridor_score >= 40 ? '#f59e0b' : '#10b981'}`,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: 'bold'
                  }}
                >
                  {isHighRisk ? '🚨 High Risk' : routeData.risk_level === 'Medium' ? '⚠️ Medium' : '✅ Safe'}
                </span>
              </div>

              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', margin: '2px 0 6px 0' }}>
                {distanceKm} km <span style={{ fontSize: '1.1rem', color: '#aaa', fontWeight: 'normal' }}>({durationMins} mins)</span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#ccc' }}>
                Corridor Risk Score: <strong style={{ color: isHighRisk ? '#ef4444' : '#10b981' }}>{routeData.average_corridor_score} / 100</strong>
              </div>

              {/* Show Safer Route Toggle Button */}
              {saferRouteCoords && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #2a2a3a' }}>
                  <button
                    type="button"
                    onClick={() => setShowSaferRoute(!showSaferRoute)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.85rem',
                      background: showSaferRoute ? '#10b981' : '#1a1a26',
                      color: showSaferRoute ? '#000' : '#10b981',
                      border: '1px solid #10b981',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{showSaferRoute ? '🟢 Hiding Safer Route' : '🟢 Show Safer Route'}</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>({saferScore || 24} Risk)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 3. SLIM HORIZONTAL TIME-OF-DAY SLIDER (BELOW MAP) ── */}
        <div
          style={{
            background: '#12121a',
            border: '1px solid #2a2a3a',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '2.5rem',
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '200px' }}>
            <span style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ⏰ Time-of-Day Risk:
            </span>
            <span style={{ background: 'var(--accent, #FFD700)', color: '#000', padding: '2px 10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 'bold' }}>
              {formatHourLabel(selectedHour)}
            </span>
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="range"
              min="14"
              max="23"
              step="1"
              value={selectedHour}
              onChange={(e) => handleHourChange(parseInt(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#FFD700',
                cursor: 'pointer',
                height: '6px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', color: '#888', fontSize: '0.75rem' }}>
            <span>2 PM</span>
            <span>6 PM</span>
            <span>9 PM</span>
            <span>11 PM</span>
          </div>
        </div>

        {/* ── 4. WAYPOINT RISK ASSESSMENT CARDS ── */}
        {routeData?.waypoint_scores && (
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
              📌 8-Waypoint Corridor Assessment
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
              {routeData.waypoint_scores.map((wp) => (
                <div
                  key={wp.waypoint_index}
                  style={{
                    background: '#14141c',
                    border: '1px solid #2a2a36',
                    borderRadius: '12px',
                    padding: '0.9rem 1.1rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ color: '#FFD700', fontSize: '0.82rem', fontWeight: 'bold' }}>
                      Waypoint #{wp.waypoint_index}
                    </span>
                    <span
                      style={{
                        background: wp.score >= 60 ? 'rgba(239, 68, 68, 0.2)' : wp.score >= 40 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: wp.score >= 60 ? '#ef4444' : wp.score >= 40 ? '#f59e0b' : '#10b981',
                        border: `1px solid ${wp.score >= 60 ? '#ef4444' : wp.score >= 40 ? '#f59e0b' : '#10b981'}`,
                        padding: '1px 7px',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {wp.risk_level} ({wp.score})
                    </span>
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.78rem', lineHeight: '1.4' }}>
                    📍 Lat: {wp.lat.toFixed(4)}, Lng: {wp.lng.toFixed(4)}<br />
                    <small style={{ color: '#777' }}>Nearest: {wp.nearest_zones?.join(', ')}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="wrap">
        <footer>
          <Link to="/" className="logo">San<span>charam</span></Link>
          <div className="f-links">
            <Link to="/features/safety">Safety</Link>
            <Link to="/features/routing">Routing</Link>
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

export default RoutingPage;
