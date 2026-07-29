import React from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import useAppStore from '@/store/useAppStore';

const SafetyPage = () => {
  const riskZones = useAppStore((state) => state.riskZones);

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
        {/* ── Summary Cards ── */}
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

        {/* ── Interactive Leaflet Map ── */}
        <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
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

              return (
                <CircleMarker
                  key={zone.id || idx}
                  center={[lat, lng]}
                  radius={20}
                  pathOptions={{ color: color, fillColor: color, fillOpacity: 0.6 }}
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
                      <small style={{ color: '#666', fontSize: '0.75rem' }}>
                        Last Updated: {lastUpdated}
                      </small>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
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

export default SafetyPage;
