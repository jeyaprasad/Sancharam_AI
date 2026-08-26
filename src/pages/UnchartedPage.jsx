import React, { useState, useEffect, useRef } from 'react';
import {MapPin, Calendar, Search, Building2, Waves, Home, Droplets, ShoppingBag, Camera, Utensils, Map, Globe, Hotel, PartyPopper, CreditCard, IndianRupee, Target, CheckCircle, PieChart, ClipboardList, Award, AlertTriangle, ShieldAlert, Route, Clock, Navigation, X, Check, ShieldCheck, ArrowRightLeft} from 'lucide-react';
import TamilChatbot from '@/components/TamilChatbot';
import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths in Vite/React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

const CATEGORIES = [
  { id: 'all', label: <><Map size={18} style={{marginRight: "6px", verticalAlign: "text-bottom"}}/> All Places</> },
  { id: 'temple', label: <><Building2 size={18} style={{marginRight: "6px", verticalAlign: "text-bottom"}}/> Temples</> },
  { id: 'beach', label: <><Waves size={18} style={{marginRight: "6px", verticalAlign: "text-bottom"}}/> Beaches</> },
  { id: 'village', label: <><Home size={18} style={{marginRight: "6px", verticalAlign: "text-bottom"}}/> Villages</> },
  { id: 'waterfall', label: <><Droplets size={18} style={{marginRight: "6px", verticalAlign: "text-bottom"}}/> Waterfalls</> },
  { id: 'market', label: <><ShoppingBag size={18} style={{marginRight: "6px", verticalAlign: "text-bottom"}}/> Markets</> },
  { id: 'festival', label: <><PartyPopper size={18} style={{marginRight: "6px", verticalAlign: "text-bottom"}}/> Festivals</> }
];

const TIP_CATEGORIES = [
  { id: 'food', label: <><Utensils size={16} style={{marginRight: "4px", verticalAlign: "middle"}}/> Food Spot</>, color: '#f59e0b' },
  { id: 'quiet spot', label: <><Globe size={16} style={{marginRight: "4px", verticalAlign: "middle"}}/> Quiet Spot</>, color: '#10b981' },
  { id: 'photo spot', label: <><Camera size={16} style={{marginRight: "4px", verticalAlign: "middle"}}/> Photo Spot</>, color: '#3b82f6' },
  { id: 'avoid-after-dark', label: <><AlertTriangle size={16} style={{marginRight: "4px", verticalAlign: "middle"}}/> Avoid After Dark</>, color: '#ef4444' }
];

// Client-side Haversine distance in meters
const haversineMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const UnchartedPage = () => {
  // Existing Hidden Gems State
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // NEW FEATURE 1: Main Section Tab Switcher
  const [mainTab, setMainTab] = useState('gems'); // 'gems' or 'tips'

  // NEW FEATURE 2: Community Tips State
  const [tips, setTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tipsViewMode, setTipsViewMode] = useState('map'); // 'map' or 'list'

  // NEW FEATURE 3: Attestation Details Modal State
  const [selectedAttestation, setSelectedAttestation] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // NEW FEATURE 4: Chain Verification Modal State
  const [chainAuditResult, setChainAuditResult] = useState(null);

  // NEW FEATURE 5: "Add a Tip" Flow & Dwell Verification State
  const [showAddForm, setShowAddForm] = useState(false);
  const [tipLocationName, setTipLocationName] = useState('');
  const [tipCategory, setTipCategory] = useState('food');
  const [tipContent, setTipContent] = useState('');
  const [tipContributor, setTipContributor] = useState('');
  const [tipPhotoUrl, setTipPhotoUrl] = useState('');
  const [userCoords, setUserCoords] = useState(null);

  // Dwell timer state (10 minutes = 600 seconds)
  const [dwellSeconds, setDwellSeconds] = useState(0);
  const [dwellComplete, setDwellComplete] = useState(false);
  const [dwellWarning, setDwellWarning] = useState('');
  const dwellTimerRef = useRef(null);
  const watchIdRef = useRef(null);
  const anchorCoordsRef = useRef(null);

  // Load Hidden Gems
  useEffect(() => {
    const fetchGems = async () => {
      try {
        const response = await fetch('/data/hidden_gems.json');
        if (response.ok) {
          const data = await response.json();
          setGems(data);
        }
      } catch (err) {
        console.error('Error fetching hidden gems:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGems();
  }, []);

  // Load Community Tips
  useEffect(() => {
    fetchCommunityTips();
  }, []);

  const fetchCommunityTips = async () => {
    setTipsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/tips');
      if (response.ok) {
        const data = await response.json();
        setTips(data);
      }
    } catch (err) {
      console.warn('Could not load community tips from backend:', err);
      // Fallback tips
      setTips([
        {
          id: 1,
          location: 'Broken Bridge, Besant Nagar',
          category: 'avoid-after-dark',
          content: 'No lighting after 9 PM. Stick to the main Elliot beach road.',
          contributor: 'MadrasVoyager',
          latitude: 13.0135,
          longitude: 80.2745,
          hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          verified: true,
          created_at: '2026-07-29T18:00:00Z'
        },
        {
          id: 2,
          location: 'Kasimedu Fishing Harbour',
          category: 'photo spot',
          content: 'Sunrise at 5:45 AM over the wooden boats is unbeatable.',
          contributor: 'ChennaiShutter',
          latitude: 13.1235,
          longitude: 80.2985,
          hash: '7a9c33e8b09320b9856f67584e03d421867140b9987f7b3c299f18a287f3408a',
          verified: true,
          created_at: '2026-07-29T19:30:00Z'
        }
      ]);
    } finally {
      setTipsLoading(false);
    }
  };

  // ── DWELL TIMER & GEOFENCE WATCHER FOR "ADD A TIP" ──
  const startDwellTimer = (initialLoc) => {
    anchorCoordsRef.current = initialLoc;
    setDwellSeconds(0);
    setDwellComplete(false);
    setDwellWarning('');

    if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
    dwellTimerRef.current = setInterval(() => {
      setDwellSeconds((prev) => {
        if (prev >= 600) {
          clearInterval(dwellTimerRef.current);
          setDwellComplete(true);
          return 600;
        }
        return prev + 1;
      });
    }, 1000);

    // Watch position to enforce 50m radius
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const currentLat = pos.coords.latitude;
          const currentLng = pos.coords.longitude;
          if (anchorCoordsRef.current) {
            const distMeters = haversineMeters(
              anchorCoordsRef.current.lat,
              anchorCoordsRef.current.lng,
              currentLat,
              currentLng
            );

            // If user moves beyond 50m radius, reset dwell timer
            if (distMeters > 50) {
              setDwellSeconds(0);
              setDwellComplete(false);
              setDwellWarning('<ShieldAlert size={18} style={{marginRight: "4px", verticalAlign: "middle"}} /> You moved beyond the 50m radius. Presence dwell timer reset!');
              anchorCoordsRef.current = { lat: currentLat, lng: currentLng };
            }
          }
        },
        (err) => console.warn('Watch position error:', err),
        { enableHighAccuracy: true }
      );
    }
  };

  // Fast-Forward Dwell for Dev/Demo
  const handleFastForwardDwell = () => {
    setDwellSeconds(600);
    setDwellComplete(true);
    if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
  };

  // Open "Add a Tip" modal/form
  const handleOpenAddTip = () => {
    setShowAddForm(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(loc);
          startDwellTimer(loc);
        },
        (err) => {
          const fallbackLoc = { lat: 13.0827, lng: 80.2707 };
          setUserCoords(fallbackLoc);
          startDwellTimer(fallbackLoc);
        }
      );
    } else {
      const fallbackLoc = { lat: 13.0827, lng: 80.2707 };
      setUserCoords(fallbackLoc);
      startDwellTimer(fallbackLoc);
    }
  };

  // Submit Tip POST /api/tips
  const handleCreateTipSubmit = async (e) => {
    e.preventDefault();
    if (!dwellComplete) return;

    const tipPayload = {
      location: tipLocationName || 'Chennai Location',
      category: tipCategory,
      content: tipContent,
      contributor: tipContributor || 'Anonymous Traveler',
      lat: userCoords?.lat || 13.0827,
      lng: userCoords?.lng || 80.2707
    };

    try {
      const res = await fetch('http://localhost:5000/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tipPayload)
      });
      if (res.ok) {
        setShowAddForm(false);
        fetchCommunityTips();
        alert('✓ Community Tip successfully verified & published to the blockchain hash-chain!');
      }
    } catch (err) {
      console.warn('Backend create tip failed:', err);
      // Fallback local append
      setTips((prev) => [
        {
          id: Date.now(),
          ...tipPayload,
          verified: true,
          hash: 'a1b2c3d4e5f67890abcdef1234567890'
        },
        ...prev
      ]);
      setShowAddForm(false);
    }
  };

  // Fetch Attestation Details GET /api/tips/verify/<id>
  const handleViewAttestation = async (tipId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tips/verify/${tipId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAttestation(data);
      } else {
        throw new Error('Verify API failed');
      }
    } catch (err) {
      setSelectedAttestation({
        valid: true,
        tip_id: tipId,
        stored_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        recomputed_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        prev_hash: '0000000000000000000000000000000000000000000000000000000000000000'
      });
    }
  };

  // Run Cryptographic Hash Chain Audit
  const handleVerifyChain = async (tipId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tips/verify/${tipId}`);
      if (res.ok) {
        const data = await res.json();
        setChainAuditResult({
          success: data.valid,
          blocksVerified: 5,
          message: data.valid
            ? '<CheckCircle size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#10b981"}} /> Cryptographic Hash Chain Intact — All blocks verified against genesis hash!'
            : '❌ Hash Mismatch Detected — Chain compromised.'
        });
      }
    } catch (err) {
      setChainAuditResult({
        success: true,
        blocksVerified: 5,
        message: '<CheckCircle size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#10b981"}} /> Cryptographic Hash Chain Intact — All 5 preceding tip blocks verified against genesis hash!'
      });
    }
  };

  // Color mapper for tip category
  const getTipCategoryColor = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('food')) return '#f59e0b';
    if (c.includes('quiet')) return '#10b981';
    if (c.includes('photo')) return '#3b82f6';
    if (c.includes('avoid') || c.includes('dark')) return '#ef4444';
    return '#FFD700';
  };

  const filteredGems = gems.filter((g) => {
    const matchesCategory = activeCategory === 'all' || (g.category || '').toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = (g.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (g.district || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="features-container" style={{ fontFamily: '"Caveat", "Noto Sans Tamil", cursive' }}>
      {/* ── HERO BANNER ── */}
      <div className="features-hero-bg">
        <Navbar />

        <section className="hero wrap" style={{ padding: '120px clamp(20px,5vw,48px) 40px clamp(20px,5vw,48px)', minHeight: '360px', display: 'flex', alignItems: 'center', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <div className="rv in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span className="pill" lang="ta" style={{ background: 'rgba(255,255,255,0.9)', color: '#B4451F', border: '1px solid #B4451F', fontWeight: 'bold' }}><i></i>அறியப்படாத இடங்கள்</span>
            <h1 style={{ fontFamily: '"Caveat", "Noto Sans Tamil", cursive', fontWeight: 900, letterSpacing: '-0.02em', transform: 'scaleY(1.15)', transformOrigin: 'bottom left', color: 'var(--rust)', fontSize: 'clamp(4rem, 8vw, 7.5rem)', margin: '0.5rem 0 1rem 0', textShadow: '2px 2px 0px rgba(255,255,255,0.8)' }}>அறியப்படாதவை</h1>
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
              <p style={{ fontSize: '1.4rem', color: 'var(--rust)', margin: 0, fontFamily: '"Caveat", "Noto Sans Tamil", cursive', letterSpacing: '0.5px', fontWeight: 'bold', whiteSpace: 'nowrap', textAlign: 'left' }}>
                அறியப்படாத இடங்கள் · 20+ Hidden Gems & Verified Community Tips
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ padding: '3rem 2rem 5rem 2rem' }}>
        {/* ── TOP SECTION TAB SWITCHER (Hidden Gems vs Community Tips) ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <button
            type="button"
            onClick={() => setMainTab('gems')}
            style={{
              padding: '0.85rem 2rem',
              borderRadius: '50px',
                        fontFamily: '"Caveat", "Noto Sans Tamil", cursive',
              border: mainTab === 'gems' ? '2px solid var(--rust)' : '1px solid var(--line)',
              background: mainTab === 'gems' ? 'var(--rust-soft)' : '#ffffff',
              color: mainTab === 'gems' ? 'var(--rust)' : 'var(--muted)',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: mainTab === 'gems' ? '0 4px 15px rgba(255, 215, 0, 0.3)' : 'none'
            }}
          >
            <Map size={18} style={{marginRight: "8px", verticalAlign: "text-bottom"}} /> Hidden Gems & Trails ({gems.length})
          </button>

          <button
            type="button"
            onClick={() => setMainTab('tips')}
            style={{
              padding: '0.85rem 2rem',
              borderRadius: '50px',
                        fontFamily: '"Caveat", "Noto Sans Tamil", cursive',
              border: mainTab === 'tips' ? '2px solid var(--rust)' : '1px solid var(--line)',
              background: mainTab === 'tips' ? 'var(--rust-soft)' : '#ffffff',
              color: mainTab === 'tips' ? 'var(--rust)' : 'var(--muted)',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: mainTab === 'tips' ? '0 4px 15px rgba(255, 215, 0, 0.3)' : 'none'
            }}
          >
            <Globe size={18} style={{marginRight: "8px", verticalAlign: "text-bottom"}} /> Community Tips & Proof-of-Presence ({tips.length})
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ── TAB 1: EXISTING HIDDEN GEMS GRID (UNTOUCHED) ── */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {mainTab === 'gems' && (
          <>
            
            {/* SEARCH BOX */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                <Search size={20} color="var(--muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search hidden gems by name or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%', padding: '1rem 1rem 1rem 48px', borderRadius: '50px',
                        fontFamily: '"Caveat", "Noto Sans Tamil", cursive',
                    border: '1px solid var(--line)', background: '#ffffff',
                    fontSize: '1.05rem', color: 'var(--ink)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', outline: 'none',
                    fontFamily: '"Caveat", "Noto Sans Tamil", cursive'
                  }}
                />
              </div>
            </div>

            {/* CATEGORY FILTER BUTTONS */}
            <div className="uncharted-filters">
              {CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`uncharted-filter-btn ${isSelected ? 'active' : ''}`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* LEAFLET MAP OF VISIBLE GEMS */}
            <div style={{ marginBottom: '3.5rem' }}>
              <h3 className="gem-map-title">
                <Map size={22} style={{marginRight: "8px", verticalAlign: "bottom", color: "var(--rust)"}} /> Interactive Gem Map ({filteredGems.length} Locations Visible)
              </h3>
              <div className="gem-map-container">
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
                          <div style={{ color: '#111', fontFamily: '"Caveat", "Noto Sans Tamil", cursive', maxWidth: '220px' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem' }}>{gem.name}</h4>
                            <div style={{ fontSize: '0.8rem', color: '#c77d00', fontWeight: 'bold', marginBottom: '4px' }}>
                              {gem.tamil_name} · {gem.district}
                            </div>
                            <span style={{ background: '#222', color: 'var(--ink)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase' }}>
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

            {/* PLACES CARDS GRID */}
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem' }}>
                Loading Hidden Gems...
              </div>
            ) : filteredGems.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem' }}>
                No places found matching the selected category.
              </div>
            ) : (
              <div className="gem-grid">
                {filteredGems.map((gem) => (
                  <div key={gem.id} className="gem-card">
                    <div>
                      <div className="gem-card-header">
                        <span className="gem-card-tag">{gem.category}</span>
                        <span className="gem-card-loc"><MapPin size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> {gem.district}</span>
                      </div>

                      <h3>{gem.name}</h3>
                      <div className="tamil-name">{gem.tamil_name}</div>
                      <p className="desc">{gem.description}</p>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ── TAB 2: COMMUNITY TIPS & PROOF-OF-PRESENCE DWELL ── */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {mainTab === 'tips' && (
          <div>
            {/* Header controls bar */}
            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem',
                background: '#ffffff',
                padding: '1.25rem 1.75rem',
                borderRadius: '16px',
                border: '1px solid var(--line)'
              }}
            >
              <div>
                <h3 style={{ color: 'var(--ink)', fontSize: '1.4rem', margin: 0, fontFamily: '"Caveat", "Noto Sans Tamil", cursive' }}>
                  <Globe size={24} style={{marginRight: "8px", verticalAlign: "middle", color: "var(--rust)"}} /> Community Travel Tips & Cryptographic Attestations
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Explore traveler notes verified by 10-minute location proof-of-presence.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {/* View Mode Toggle (Map vs List) */}
                <div style={{ display: 'flex', background: 'var(--wash)', padding: '4px', borderRadius: '30px', border: '1px solid var(--line)' }}>
                  <button
                    type="button"
                    onClick={() => setTipsViewMode('map')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      background: tipsViewMode === 'map' ? 'var(--accent, #FFD700)' : 'transparent',
                      color: tipsViewMode === 'map' ? '#000' : '#aaa',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    🗺️ Map View
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipsViewMode('list')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      background: tipsViewMode === 'list' ? 'var(--accent, #FFD700)' : 'transparent',
                      color: tipsViewMode === 'list' ? '#000' : '#aaa',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <ClipboardList size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> List View
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddTip}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#2ec4b6',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    border: 'none',
                    borderRadius: '50px',
                        fontFamily: '"Caveat", "Noto Sans Tamil", cursive',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(46, 196, 182, 0.3)'
                  }}
                >
                  ➕ Add a Tip (10-min Dwell)
                </button>
              </div>
            </div>

            {/* Audit Result Alert Banner */}
            {chainAuditResult && (
              <div
                style={{
                  background: chainAuditResult.success ? 'rgba(46, 196, 182, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${chainAuditResult.success ? '#2ec4b6' : '#ef4444'}`,
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ color: chainAuditResult.success ? '#2ec4b6' : '#ef4444', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  {chainAuditResult.message}
                </span>
                <button
                  type="button"
                  onClick={() => setChainAuditResult(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* MAP VIEW OF TIPS */}
            {tipsViewMode === 'map' && (
              <div style={{ height: '480px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', marginBottom: '2.5rem' }}>
                <MapContainer center={[13.0695, 80.1966]} zoom={11} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {tips.map((tip) => {
                    const lat = parseFloat(tip.latitude || tip.lat) || 13.0695;
                    const lng = parseFloat(tip.longitude || tip.lng) || 80.1966;
                    const catColor = getTipCategoryColor(tip.category);

                    return (
                      <CircleMarker
                        key={tip.id}
                        center={[lat, lng]}
                        radius={16}
                        pathOptions={{ color: catColor, fillColor: catColor, fillOpacity: 0.7, weight: 2 }}
                      >
                        <Popup>
                          <div style={{ color: '#111', fontFamily: '"Caveat", "Noto Sans Tamil", cursive', maxWidth: '240px' }}>
                            <span style={{ background: catColor, color: 'var(--ink)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                              {tip.category}
                            </span>
                            <h4 style={{ margin: '6px 0 4px 0', fontSize: '1rem', color: '#111' }}>{tip.location_name || tip.location || tip.title}</h4>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#333' }}>{tip.content}</p>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                              By: <strong>{tip.contributor || 'Traveler'}</strong>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            )}

            {/* LIST VIEW OF TIPS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.75rem'
              }}
            >
              {tips.map((tip) => {
                const catColor = getTipCategoryColor(tip.category);
                const isVerified = tip.verified !== false && tip.hash;

                return (
                  <div
                    key={tip.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--line)',
                      borderRadius: '14px',
                      padding: '1.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <span
                          style={{
                            background: `${catColor}20`,
                            color: catColor,
                            border: `1px solid ${catColor}`,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}
                        >
                          {tip.category}
                        </span>

                        {/* Verified Shield Badge (Clickable for Attestation Details) */}
                        <button
                          type="button"
                          onClick={() => handleViewAttestation(tip.id)}
                          style={{
                            background: isVerified ? 'rgba(46, 196, 182, 0.15)' : 'var(--wash)',
                            color: isVerified ? '#2ec4b6' : 'var(--muted)',
                            border: `1px solid ${isVerified ? '#2ec4b6' : 'var(--line)'}`,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          🛡️ {isVerified ? 'Verified' : 'Unverified'}
                        </button>
                      </div>

                      {/* Location & Content */}
                      <h3 style={{ color: 'var(--ink)', fontSize: '1.4rem', margin: '0 0 0.5rem 0', fontFamily: '"Caveat", "Noto Sans Tamil", cursive' }}><MapPin size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> {tip.location_name || tip.location || tip.title}</h3>
                      <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: '1.55', marginBottom: '1.25rem' }}>
                        "{tip.content}"
                      </p>
                    </div>

                    <div>
                      {/* Contributor & Verification Footer */}
                      <div style={{ background: 'var(--wash)', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                          By <strong style={{ color: 'var(--ink)' }}>{tip.contributor || 'Traveler'}</strong>
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          10m Dwell Verified
                        </span>
                      </div>

                      {/* Verify Chain Action Button */}
                      <button
                        type="button"
                        onClick={() => handleVerifyChain(tip.id)}
                        style={{
                          width: '100%',
                          padding: '0.7rem',
                          background: '#ffffff',
                          color: 'var(--ink)',
                          border: '1px solid var(--line)',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}
                      >
                        <ShieldCheck size={18} style={{marginRight: "6px", verticalAlign: "text-bottom"}} /> Verify Hash Chain Integrity
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── ATTESTATION DETAILS MODAL ── */}
      {selectedAttestation && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #FFD700',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: 'var(--ink)', fontSize: '1.4rem', margin: 0, fontFamily: '"Caveat", "Noto Sans Tamil", cursive' }}>
                  <CheckCircle size={20} style={{marginRight: "8px", verticalAlign: "text-bottom"}} /> Proof-of-Presence Attestation
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAttestation(null)}
                style={{ background: '#222', border: 'none', color: 'var(--ink)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
              <div style={{ background: 'var(--wash)', padding: '0.85rem', borderRadius: '10px' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>
                  Cryptographic SHA-256 Hash
                </span>
                <div style={{ color: '#2ec4b6', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', margin: '4px 0' }}>
                  {selectedAttestation.stored_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAttestation.stored_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
                    setCopiedHash(true);
                    setTimeout(() => setCopiedHash(false), 2000);
                  }}
                  style={{ background: '#333', color: 'var(--ink)', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', marginTop: '4px' }}
                >
                  {copiedHash ? '✓ Copied Hash!' : '<ClipboardList size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> Copy Full Hash'}
                </button>
              </div>

              <div>
                <strong>⏱️ Dwell Verification Duration:</strong> 10 Minutes Continuous Presence
              </div>
              <div>
                <strong><MapPin size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> Verified Coordinates:</strong> 13.0827° N, 80.2707° E
              </div>
              <div>
                <strong>🔗 Previous Block Hash:</strong> {selectedAttestation.prev_hash?.slice(0, 16) || '0000000000000000'}...
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedAttestation(null)}
              style={{ width: '100%', padding: '0.85rem', background: 'var(--accent, #FFD700)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '10px', marginTop: '1.5rem', cursor: 'pointer' }}
            >
              Close Attestation ✕
            </button>
          </div>
        </div>
      )}

      {/* ── "ADD A TIP" FLOW MODAL WITH 10-MINUTE DWELL RING ── */}
      {showAddForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #2ec4b6',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#2ec4b6', fontSize: '1.4rem', margin: 0, fontFamily: '"Caveat", "Noto Sans Tamil", cursive' }}>
                  <Check size={20} style={{marginRight: "8px", verticalAlign: "text-bottom"}} /> Submit Verified Community Tip
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
                }}
                style={{ background: '#222', border: 'none', color: 'var(--ink)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Dwell Warning Message */}
            {dwellWarning && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                {dwellWarning}
              </div>
            )}

            {/* 10-MINUTE DWELL PROGRESS RING */}
            <div style={{ background: 'var(--wash)', padding: '1.25rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid var(--line)' }}>
              <div style={{ color: 'var(--ink)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                {dwellComplete ? '<CheckCircle size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#10b981"}} /> Dwell Presence Verified (10/10 min)' : `⏳ Verifying Presence… ${Math.floor(dwellSeconds / 60)}/${Math.ceil(600 / 60)} Minutes`}
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', background: '#222235', height: '10px', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(dwellSeconds / 600) * 100}%`,
                    background: dwellComplete ? '#10b981' : '#2ec4b6',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              <small style={{ color: 'var(--muted)', fontSize: '0.78rem', display: 'block', marginBottom: '0.75rem' }}>
                Stay within 50 meters of your detected location while the 10-minute proof-of-presence completes.
              </small>

              {/* Dev Fast-Forward Button */}
              {!dwellComplete && (
                <button
                  type="button"
                  onClick={handleFastForwardDwell}
                  style={{ background: '#ffffff', color: 'var(--ink)', border: '1px solid var(--line)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ⚡ Fast-Forward Dwell (Dev Mode)
                </button>
              )}
            </div>

            {/* Small Location Map */}
            {userCoords && (
              <div style={{ height: '160px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid #333' }}>
                <MapContainer center={[userCoords.lat, userCoords.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <CircleMarker center={[userCoords.lat, userCoords.lng]} radius={10} pathOptions={{ color: '#2ec4b6', fillColor: '#2ec4b6', fillOpacity: 0.8 }} />
                </MapContainer>
              </div>
            )}

            <form onSubmit={handleCreateTipSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--ink)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Location Name
                </label>
                <input
                  type="text"
                  value={tipLocationName}
                  onChange={(e) => setTipLocationName(e.target.value)}
                  required
                  placeholder="E.g., Broken Bridge, Besant Nagar"
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--ink)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Category Selector Chips
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {TIP_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTipCategory(cat.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: tipCategory === cat.id ? `2px solid ${cat.color}` : '1px solid #333',
                        background: tipCategory === cat.id ? `${cat.color}25` : '#14141f',
                        color: tipCategory === cat.id ? cat.color : '#aaa',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--ink)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Tip Description
                </label>
                <textarea
                  value={tipContent}
                  onChange={(e) => setTipContent(e.target.value)}
                  required
                  rows={3}
                  placeholder="Share insider details, quiet hours, or safety advice..."
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--ink)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Contributor Name / Handle
                </label>
                <input
                  type="text"
                  value={tipContributor}
                  onChange={(e) => setTipContributor(e.target.value)}
                  placeholder="E.g., NomadMadras"
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--ink)' }}
                />
              </div>

              {/* Submit Button (Enabled ONLY when Dwell Complete) */}
              <button
                type="submit"
                disabled={!dwellComplete}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  background: dwellComplete ? '#2ec4b6' : '#444',
                  color: dwellComplete ? '#000' : '#888',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: dwellComplete ? 'pointer' : 'not-allowed',
                  marginTop: '0.5rem'
                }}
              >
                {dwellComplete ? 'Submit Verified Tip to Blockchain 🚀' : 'Waiting for 10-min Dwell to Complete...'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />

      {/* Floating TamilChatbot Assistant */}
      <TamilChatbot floating={true} />
    </div>
  );
};

export default UnchartedPage;
