import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TamilChatbot from '@/components/TamilChatbot';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths in Vite/React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

const CATEGORIES = [
  { id: 'all', label: 'All Places' },
  { id: 'temple', label: '🛕 Temples' },
  { id: 'beach', label: '🏖️ Beaches' },
  { id: 'village', label: '🏡 Villages' },
  { id: 'waterfall', label: '🌊 Waterfalls' },
  { id: 'market', label: '🛍️ Markets' },
  { id: 'festival', label: '🎉 Festivals' }
];

const UnchartedPage = () => {
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchGems = async () => {
      try {
        const response = await fetch('/data/hidden_gems.json');
        if (response.ok) {
          const data = await response.json();
          setGems(data);
        } else {
          throw new Error('Could not load hidden_gems.json');
        }
      } catch (err) {
        console.error('Error fetching hidden gems:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGems();
  }, []);

  const filteredGems =
    activeCategory === 'all'
      ? gems
      : gems.filter(
          (g) => (g.category || '').toLowerCase() === activeCategory.toLowerCase()
        );

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
              <Link to="/features/uncharted" aria-current="page">Uncharted</Link>
              <Link to="/features/itinerary">Planner</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap" style={{ paddingTop: '120px', minHeight: '340px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>அறியப்படாத இடங்கள்</span>
            <h1>Uncharted <em>Tamil Nadu</em></h1>
            <p className="hero-sub" style={{ fontSize: '1.3rem', color: 'var(--accent, #FFD700)', marginTop: '0.5rem' }}>
              அறியப்படாத இடங்கள் · 20+ Hidden Gems, Heritage Ruins & Secret Trails
            </p>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '3rem 2rem 5rem 2rem' }}>
        {/* ── CATEGORY FILTER BUTTONS ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '50px',
                  border: isSelected ? '2px solid #FFD700' : '1px solid #33334d',
                  background: isSelected ? 'rgba(255, 215, 0, 0.15)' : '#14141d',
                  color: isSelected ? '#FFD700' : '#bbb',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── LEAFLET MAP OF VISIBLE GEMS ── */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
            🗺️ Interactive Gem Map ({filteredGems.length} Locations Visible)
          </h3>
          <div style={{ height: '380px', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid #333' }}>
            <MapContainer
              center={[10.8000, 78.7000]}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredGems.map((gem) => {
                if (!gem.coordinates || gem.coordinates.length < 2) return null;
                return (
                  <Marker key={gem.id} position={gem.coordinates}>
                    <Popup>
                      <div style={{ color: '#111', fontFamily: 'sans-serif', maxWidth: '220px' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem' }}>{gem.name}</h4>
                        <div style={{ fontSize: '0.8rem', color: '#c77d00', fontWeight: 'bold', marginBottom: '4px' }}>
                          {gem.tamil_name} · {gem.district}
                        </div>
                        <span style={{ background: '#222', color: '#FFD700', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                          {gem.category}
                        </span>
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#444', lineHeight: '1.3' }}>
                          {gem.description}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* ── PLACES CARDS GRID ── */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '3rem' }}>
            Loading Hidden Gems...
          </div>
        ) : filteredGems.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '3rem' }}>
            No places found matching the selected category.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {filteredGems.map((gem) => (
              <div
                key={gem.id}
                style={{
                  background: '#14141f',
                  border: '1px solid #28283a',
                  borderRadius: '14px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease'
                }}
              >
                <div>
                  {/* Category & District Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        background: 'rgba(255, 215, 0, 0.12)',
                        color: '#FFD700',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      {gem.category}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#aaa' }}>📍 {gem.district}</span>
                  </div>

                  {/* Name & Tamil Name */}
                  <h3 style={{ color: '#fff', fontSize: '1.35rem', margin: '0 0 2px 0', lineHeight: '1.2' }}>{gem.name}</h3>
                  <div style={{ color: '#FFD700', fontSize: '1rem', fontFamily: "'Yatra One', cursive", marginBottom: '1rem' }}>
                    {gem.tamil_name}
                  </div>

                  {/* Description */}
                  <p style={{ color: '#ccc', fontSize: '0.92rem', lineHeight: '1.55', marginBottom: '1.25rem' }}>
                    {gem.description}
                  </p>
                </div>

                <div>
                  {/* Details Block */}
                  <div style={{ background: '#1a1a28', padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#ddd' }}>
                      <strong style={{ color: '#FFD700' }}>🗓️ Best Season:</strong> {gem.best_season}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#ddd' }}>
                      <strong style={{ color: '#FFD700' }}>🛣️ How to Reach:</strong> {gem.how_to_reach}
                    </div>
                  </div>

                  {/* Insider Tip Box */}
                  <div
                    style={{
                      background: 'rgba(46, 196, 182, 0.08)',
                      borderLeft: '3px solid #2ec4b6',
                      padding: '0.75rem 1rem',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.85rem',
                      color: '#a0ece2',
                      fontStyle: 'italic',
                      lineHeight: '1.4'
                    }}
                  >
                    💡 <strong>Insider Tip:</strong> {gem.tip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* Floating TamilChatbot Assistant */}
      <TamilChatbot floating={true} />
    </div>
  );
};

export default UnchartedPage;
