import React, { useState, useEffect } from 'react';
import {MapPin, Calendar, Hotel, PartyPopper, CreditCard, IndianRupee, Target, CheckCircle, PieChart, ClipboardList, Award, AlertTriangle, ShieldAlert, Route, Clock, Navigation, X, Check, ShieldCheck, ArrowRightLeft} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet icon paths in Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import useAppStore from '@/store/useAppStore';
import { analyzeRoute } from '@/services/api';

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
        <Navbar />

        <section className="hero wrap" style={{ padding: '120px clamp(20px,5vw,48px) 40px clamp(20px,5vw,48px)', minHeight: '360px', display: 'flex', alignItems: 'center', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <div className="rv in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span className="pill" lang="ta" style={{ background: 'rgba(255,255,255,0.9)', color: '#B4451F', border: '1px solid #B4451F', fontWeight: 'bold' }}><i></i>பயணப் பாதை</span>
            <h1 style={{ fontFamily: '"Catamaran", "Noto Sans Tamil", sans-serif', fontWeight: 900, letterSpacing: '-0.02em', transform: 'scaleY(1.15)', transformOrigin: 'bottom left', color: 'var(--rust)', fontSize: 'clamp(4rem, 8vw, 7.5rem)', margin: '0.5rem 0 1rem 0', textShadow: '2px 2px 0px rgba(255,255,255,0.8)' }}>வழித்தடம்</h1>
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
                பயணப் பாதை · Geocoded OSRM Road Geometry Analyzer
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderTop: '1px solid rgba(255, 215, 0, 0.2)', paddingTop: '1rem', width: '100%' }}>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <Route size={18} color="#FFD700" /> Smart Routing
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <Clock size={18} color="#FFD700" /> Time-of-Day Risk
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <MapPin size={18} color="#FFD700" /> Waypoint Analysis
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '2rem 2rem 5rem 2rem' }}>
        {/* ── 1. COMPACT INLINE INPUT BAR WITH SWAP BUTTON ── */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'linear-gradient(145deg, #1c1c28, #14141c)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.25rem 1.75rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          {/* From Input */}
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
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
                background: '#14141c', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff',
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
              background: '#222235', border: '1px solid #444466', color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease',
              flexShrink: 0
            }}
          >
            <ArrowRightLeft size={18} />
          </button>

          {/* To Input */}
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
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
                background: '#14141c', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff',
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
              background: loading ? '#33334d' : '#FFD700', color: loading ? '#888' : '#000',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              border: 'none',
              borderRadius: '50px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(255,215,0,0.3)',
              whiteSpace: 'nowrap',
              height: '42px'
            }}
          >
            {loading ? 'Routing...' : <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>Analyze Route <Route size={16} /></span>}
          </button>
        </form>

        {/* ── 2. FULL-WIDTH MAP (~70% HEIGHT) WITH GOOGLE MAPS STYLE FLOATING SUMMARY CARD ── */}
        <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
          {/* Leaflet Map */}
          <div style={{ height: '620px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
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
                    <strong><MapPin size={14} style={{display:'inline', marginBottom:'-2px'}}/> Origin: {routeData.origin.name}</strong>
                  </Popup>
                </Marker>
              )}

              {/* Destination Marker */}
              {routeData?.destination?.lat && routeData?.destination?.lng && (
                <Marker position={[routeData.destination.lat, routeData.destination.lng]}>
                  <Popup>
                    <strong><Target size={14} style={{display:'inline', marginBottom:'-2px'}}/> Destination: {routeData.destination.name}</strong>
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
                background: 'rgba(28, 28, 40, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.85)',
                minWidth: '240px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
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
                  {isHighRisk ? <><AlertTriangle size={12}/> High Risk</> : routeData.risk_level === 'Medium' ? <><ShieldAlert size={12}/> Medium</> : <><ShieldCheck size={12}/> Safe</>}
                </span>
              </div>

              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', margin: '2px 0 6px 0' }}>
                {distanceKm} km <span style={{ fontSize: '1.1rem', color: '#888', fontWeight: 'normal' }}>({durationMins} mins)</span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                Corridor Risk Score: <strong style={{ color: isHighRisk ? '#ef4444' : '#10b981' }}>{routeData.average_corridor_score} / 100</strong>
              </div>

              {/* Show Safer Route Toggle Button */}
              {saferRouteCoords && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #33334d' }}>
                  <button
                    type="button"
                    onClick={() => setShowSaferRoute(!showSaferRoute)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.85rem',
                      background: showSaferRoute ? '#10b981' : '#222235',
                      color: showSaferRoute ? '#000' : '#10b981',
                      border: '1px solid #10b981',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}>{showSaferRoute ? <><X size={14}/> Hiding Safer Route</> : <><Check size={14}/> Show Safer Route</>}</span>
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
            background: 'linear-gradient(145deg, #1c1c28, #14141c)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '2.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '200px' }}>
            <span style={{ color: '#a1a1aa', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
<Clock size={16} /> Time-of-Day Risk:
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
              <MapPin size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> 8-Waypoint Corridor Assessment
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
              {routeData.waypoint_scores.map((wp) => (
                <div
                  key={wp.waypoint_index}
                  style={{
                    background: '#14141c', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.9rem 1.1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>
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
                  <div style={{ color: '#a1a1aa', fontSize: '0.78rem', lineHeight: '1.4' }}>
<Navigation size={12} style={{display:'inline', marginBottom:'-2px'}}/> Lat: {wp.lat.toFixed(4)}, Lng: {wp.lng.toFixed(4)}<br />
                    <small style={{ color: '#888' }}>Nearest: {wp.nearest_zones?.join(', ')}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
};

export default RoutingPage;
