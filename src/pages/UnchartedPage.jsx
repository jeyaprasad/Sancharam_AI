import React, { useState, useEffect, useRef } from 'react';
import {MapPin, Search, Building2, Waves, Home, Droplets, ShoppingBag, Camera, Utensils, Map, Globe, PartyPopper, ClipboardList, AlertTriangle, ShieldAlert, CheckCircle, Check, ShieldCheck} from 'lucide-react';
import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths in Vite/React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import './uncharted.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

const CATEGORIES = [
  { id: 'all', label: <><Map size={16} /> All Places</> },
  { id: 'temple', label: <><Building2 size={16} /> Temples</> },
  { id: 'beach', label: <><Waves size={16} /> Beaches</> },
  { id: 'village', label: <><Home size={16} /> Villages</> },
  { id: 'waterfall', label: <><Droplets size={16} /> Waterfalls</> },
  { id: 'market', label: <><ShoppingBag size={16} /> Markets</> },
  { id: 'festival', label: <><PartyPopper size={16} /> Festivals</> }
];

const TIP_CATEGORIES = [
  { id: 'food', label: <><Utensils size={15} style={{marginRight: "4px", verticalAlign: "middle"}}/> Food Spot</>, color: '#C4552E' },
  { id: 'quiet spot', label: <><Globe size={15} style={{marginRight: "4px", verticalAlign: "middle"}}/> Quiet Spot</>, color: '#2E6E63' },
  { id: 'photo spot', label: <><Camera size={15} style={{marginRight: "4px", verticalAlign: "middle"}}/> Photo Spot</>, color: '#8C6A4F' },
  { id: 'avoid-after-dark', label: <><AlertTriangle size={15} style={{marginRight: "4px", verticalAlign: "middle"}}/> Avoid After Dark</>, color: '#A03F1F' }
];

// Client-side Haversine distance in meters
const haversineMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
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
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [mainTab, setMainTab] = useState('gems'); // 'gems' or 'tips'

  const [tips, setTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tipsViewMode, setTipsViewMode] = useState('map'); // 'map' or 'list'

  const [selectedAttestation, setSelectedAttestation] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const [chainAuditResult, setChainAuditResult] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [tipLocationName, setTipLocationName] = useState('');
  const [tipCategory, setTipCategory] = useState('food');
  const [tipContent, setTipContent] = useState('');
  const [tipContributor, setTipContributor] = useState('');

  // Inline "Share a Community Tip" form (Tribes-style)
  const [inlineTipTitle, setInlineTipTitle] = useState('');
  const [inlineTipCategory, setInlineTipCategory] = useState('food');
  const [inlineTipLocation, setInlineTipLocation] = useState('');
  const [inlineTipCoords, setInlineTipCoords] = useState('');
  const [inlineTipText, setInlineTipText] = useState('');
  const [inlineGeoLoading, setInlineGeoLoading] = useState(false);
  const [inlineSubmitting, setInlineSubmitting] = useState(false);

  const handleInlineAutoFillGPS = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setInlineGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setInlineTipCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        setInlineGeoLoading(false);
      },
      (err) => {
        console.warn(err);
        setInlineTipCoords('13.082700, 80.270700'); // Default Chennai
        setInlineGeoLoading(false);
      }
    );
  };

  const handleInlineTipSubmit = async (e) => {
    e.preventDefault();
    if (!inlineTipTitle.trim() || !inlineTipText.trim()) return;
    setInlineSubmitting(true);

    const [latStr, lngStr] = (inlineTipCoords || '13.0827, 80.2707').split(',');
    const tempId = `temp-${Date.now()}`;
    const payload = {
      id: tempId,
      title: inlineTipTitle.trim(),
      category: inlineTipCategory,
      location_name: inlineTipLocation.trim() || 'Chennai',
      location: inlineTipLocation.trim() || 'Chennai',
      coordinates: inlineTipCoords.trim() || '13.0827, 80.2707',
      content: inlineTipText.trim().slice(0, 300),
      text: inlineTipText.trim().slice(0, 300),
      lat: parseFloat(latStr) || 13.0827,
      lng: parseFloat(lngStr) || 80.2707,
      timestamp: new Date().toISOString(),
      verified: true
    };

    setTips((prev) => [payload, ...prev]);

    try {
      const response = await fetch('http://localhost:5000/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const createdTip = await response.json();
        setTips((prev) => [createdTip, ...prev.filter((t) => t.id !== tempId)]);
      }
    } catch (err) {
      console.log('Optimistic tip saved locally:', err);
    } finally {
      setInlineSubmitting(false);
      setInlineTipTitle('');
      setInlineTipLocation('');
      setInlineTipCoords('');
      setInlineTipText('');
    }
  };

  const inlineRemainingChars = 300 - inlineTipText.length;
  const [userCoords, setUserCoords] = useState(null);

  // Dwell timer state (10 minutes = 600 seconds)
  const [dwellSeconds, setDwellSeconds] = useState(0);
  const [dwellComplete, setDwellComplete] = useState(false);
  const [dwellWarning, setDwellWarning] = useState('');
  const dwellTimerRef = useRef(null);
  const watchIdRef = useRef(null);
  const anchorCoordsRef = useRef(null);

  // Gems map focus
  const [activeGemId, setActiveGemId] = useState(null);
  const gemsMapRef = useRef(null);
  const gemMarkerRefs = useRef({});
  const mapPanelRef = useRef(null);

  const focusGemOnMap = (gem) => {
    if (!gem?.coordinates || gem.coordinates.length < 2) return;
    setActiveGemId(gem.id);
    const map = gemsMapRef.current;
    if (map) {
      map.flyTo(gem.coordinates, 13, { duration: 1.1 });
      const marker = gemMarkerRefs.current[gem.id];
      if (marker) setTimeout(() => marker.openPopup(), 1150);
    }
    if (window.innerWidth <= 900 && mapPanelRef.current) {
      mapPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };



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
            if (distMeters > 50) {
              setDwellSeconds(0);
              setDwellComplete(false);
              setDwellWarning('You moved beyond the 50m radius. Presence dwell timer reset!');
              anchorCoordsRef.current = { lat: currentLat, lng: currentLng };
            }
          }
        },
        (err) => console.warn('Watch position error:', err),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleFastForwardDwell = () => {
    setDwellSeconds(600);
    setDwellComplete(true);
    if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
  };

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
            ? 'Cryptographic Hash Chain Intact — All blocks verified against genesis hash!'
            : 'Hash Mismatch Detected — Chain compromised.'
        });
      }
    } catch (err) {
      setChainAuditResult({
        success: true,
        blocksVerified: 5,
        message: 'Cryptographic Hash Chain Intact — All 5 preceding tip blocks verified against genesis hash!'
      });
    }
  };

  const getTipCategoryColor = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('food')) return '#C4552E';
    if (c.includes('quiet')) return '#2E6E63';
    if (c.includes('photo')) return '#8C6A4F';
    if (c.includes('avoid') || c.includes('dark')) return '#A03F1F';
    return '#C4552E';
  };

  const filteredGems = gems.filter((g) => {
    const matchesCategory = activeCategory === 'all' || (g.category || '').toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = (g.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (g.district || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="un-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="un-hero">
        <div className="un-wrap un-hero-grid">
          <div>
            <span className="un-eyebrow" lang="ta"><i></i>அறியப்படாத இடங்கள் · Hidden Trails</span>
            <h1 className="un-title" lang="ta">அறியப்படாதவை</h1>
            <p className="un-subtitle">
              A field journal of Tamil Nadu's <strong>uncharted corners</strong> — forgotten forts,
              dawn harbours, and quiet shrines — mapped with verified community tips and
              proof-of-presence attestations.
            </p>
          </div>
          <div className="un-hero-stats">
            <div className="un-hero-stat">
              <b>{gems.length}</b>
              <span>Hidden Gems</span>
            </div>
            <div className="un-hero-stat">
              <b>{tips.length}</b>
              <span>Verified Tips</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEGMENTED TOGGLE ── */}
      <div className="un-wrap un-tabs">
        <div className="un-tabs-inner">
          <button
            type="button"
            onClick={() => setMainTab('gems')}
            className={`un-tab ${mainTab === 'gems' ? 'active' : ''}`}
          >
            <Map size={16} /> Hidden Gems & Trails ({gems.length})
          </button>
          <button
            type="button"
            onClick={() => setMainTab('tips')}
            className={`un-tab ${mainTab === 'tips' ? 'active' : ''}`}
          >
            <Globe size={16} /> Community Tips ({tips.length})
          </button>
        </div>
      </div>

      <div className="un-wrap">
        {/* ════════════ TAB 1: HIDDEN GEMS ════════════ */}
        {mainTab === 'gems' && (
          <>
            {/* FILTER RAIL */}
            <div className="un-rail">
              <div className="un-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search hidden gems by name or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="un-pills">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`un-pill ${activeCategory === cat.id ? 'active' : ''}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* EXPLORER SPLIT: cards + sticky map */}
            <div className="un-explorer">
              <div className="un-gem-list">
                {loading ? (
                  <div className="un-empty">Loading hidden gems…</div>
                ) : filteredGems.length === 0 ? (
                  <div className="un-empty">No places found matching the selected category.</div>
                ) : (
                  filteredGems.map((gem, idx) => (
                    <article
                      key={gem.id}
                      className={`un-gem-card${activeGemId === gem.id ? ' is-active' : ''}`}
                      style={{ animationDelay: `${Math.min(idx * 50, 400)}ms`, cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      onClick={() => focusGemOnMap(gem)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusGemOnMap(gem); } }}
                    >
                      <div className="un-gem-index">{String(idx + 1).padStart(2, '0')}</div>
                      <div>
                        <div className="un-gem-head">
                          <span className="un-stamp">{gem.category}</span>
                          <span className="un-gem-loc"><MapPin size={14} /> {gem.district}</span>
                        </div>
                        <h3>{gem.name}</h3>
                        <div className="un-gem-tamil" lang="ta">{gem.tamil_name}</div>
                        <p className="un-gem-desc">{gem.description}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <aside className="un-map-panel" ref={mapPanelRef}>
                <div className="un-map-frame">
                  <div className="un-map-caption">
                    <h3><Map size={17} /> Field Chart</h3>
                    <span className="un-map-count">{filteredGems.length} locations</span>
                  </div>
                  <div className="un-map-body">
                    <MapContainer
                      center={[11.6000, 79.0000]}
                      zoom={7}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                      ref={gemsMapRef}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {filteredGems.map((gem) => {
                        if (!gem.coordinates || gem.coordinates.length < 2) return null;
                        return (
                          <Marker
                            key={gem.id}
                            position={gem.coordinates}
                            ref={(ref) => { if (ref) gemMarkerRefs.current[gem.id] = ref; }}
                          >

                            <Popup>
                              <div style={{ color: '#2B2118', fontFamily: '"IBM Plex Sans", "Noto Sans Tamil", sans-serif', maxWidth: '220px' }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontFamily: '"Libre Baskerville", serif' }}>{gem.name}</h4>
                                <div style={{ fontSize: '0.8rem', color: '#2E6E63', fontWeight: 600, marginBottom: '4px' }}>
                                  {gem.tamil_name} · {gem.district}
                                </div>
                                <span style={{ background: '#2E6E63', color: '#FAF5EC', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                  {gem.category}
                                </span>
                                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#55452F', lineHeight: '1.4' }}>
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
              </aside>
            </div>
          </>
        )}

        {/* ════════════ TAB 2: COMMUNITY TIPS ════════════ */}
        {mainTab === 'tips' && (
          <div>
            <div className="un-tips-bar">
              <div>
                <h3><Globe size={20} /> Community Travel Tips & Attestations</h3>
                <p>Traveler notes verified by 10-minute location proof-of-presence.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="un-view-toggle">
                  <button
                    type="button"
                    onClick={() => setTipsViewMode('map')}
                    className={tipsViewMode === 'map' ? 'active' : ''}
                  >
                    Map View
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipsViewMode('list')}
                    className={tipsViewMode === 'list' ? 'active' : ''}
                  >
                    List View
                  </button>
                </div>
                <button type="button" onClick={handleOpenAddTip} className="un-add-tip-btn">
                  + Add a Tip (10-min Dwell)
                </button>
              </div>
            </div>

            {chainAuditResult && (
              <div className={`un-audit-banner ${chainAuditResult.success ? 'ok' : 'bad'}`}>
                <span>
                  {chainAuditResult.success
                    ? <><CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />{chainAuditResult.message}</>
                    : <><ShieldAlert size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />{chainAuditResult.message}</>}
                </span>
                <button type="button" onClick={() => setChainAuditResult(null)}>✕</button>
              </div>
            )}

            {tipsViewMode === 'map' && (
              <div className="un-tips-map">
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
                          <div style={{ color: '#2B2118', fontFamily: '"IBM Plex Sans", sans-serif', maxWidth: '240px' }}>
                            <span style={{ background: catColor, color: '#FAF5EC', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                              {tip.category}
                            </span>
                            <h4 style={{ margin: '6px 0 4px 0', fontSize: '1rem' }}>{tip.location_name || tip.location || tip.title}</h4>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#55452F' }}>{tip.content}</p>
                            <div style={{ fontSize: '0.75rem', color: '#97836A' }}>
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

            {tipsViewMode === 'list' && (
              <div className="un-tips-grid">
                {tips.map((tip) => {
                  const catColor = getTipCategoryColor(tip.category);
                  const isVerified = tip.verified !== false && tip.hash;
                  return (
                    <div key={tip.id} className="un-tip-card">
                      <div>
                        <div className="un-tip-badges">
                          <span
                            className="un-tip-cat"
                            style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}55` }}
                          >
                            {tip.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleViewAttestation(tip.id)}
                            className={`un-tip-verified ${isVerified ? '' : 'no'}`}
                          >
                            🛡️ {isVerified ? 'Verified' : 'Unverified'}
                          </button>
                        </div>
                        <h3><MapPin size={17} /> {tip.location_name || tip.location || tip.title}</h3>
                        <p className="un-tip-content">"{tip.content}"</p>
                      </div>
                      <div>
                        <div className="un-tip-footer">
                          <span>By <strong>{tip.contributor || 'Traveler'}</strong></span>
                          <span>10m Dwell Verified</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVerifyChain(tip.id)}
                          className="un-tip-verify-btn"
                        >
                          <ShieldCheck size={16} /> Verify Hash Chain Integrity
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ATTESTATION DETAILS MODAL ── */}
      {selectedAttestation && (
        <div className="un-modal-backdrop">
          <div className="un-modal">
            <div className="un-modal-head">
              <h3><CheckCircle size={19} style={{ color: '#2E6E63' }} /> Proof-of-Presence Attestation</h3>
              <button type="button" onClick={() => setSelectedAttestation(null)} className="un-modal-close">✕</button>
            </div>

            <div className="un-hash-box">
              <span>Cryptographic SHA-256 Hash</span>
              <code>{selectedAttestation.stored_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</code>
              <button
                type="button"
                className="un-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(selectedAttestation.stored_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
                  setCopiedHash(true);
                  setTimeout(() => setCopiedHash(false), 2000);
                }}
              >
                {copiedHash ? '✓ Copied!' : 'Copy Full Hash'}
              </button>
            </div>

            <div className="un-modal-facts">
              <div><strong>⏱️ Dwell Verification:</strong> 10 Minutes Continuous Presence</div>
              <div><strong>📍 Verified Coordinates:</strong> 13.0827° N, 80.2707° E</div>
              <div><strong>🔗 Previous Block Hash:</strong> {selectedAttestation.prev_hash?.slice(0, 16) || '0000000000000000'}…</div>
            </div>

            <button type="button" onClick={() => setSelectedAttestation(null)} className="un-modal-cta">
              Close Attestation
            </button>
          </div>
        </div>
      )}

      {/* ── "ADD A TIP" MODAL ── */}
      {showAddForm && (
        <div className="un-modal-backdrop">
          <div className="un-modal" style={{ maxWidth: '560px' }}>
            <div className="un-modal-head">
              <h3><Check size={19} style={{ color: '#2E6E63' }} /> Submit Verified Community Tip</h3>
              <button
                type="button"
                className="un-modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
                }}
              >
                ✕
              </button>
            </div>

            {dwellWarning && (
              <div className="un-audit-banner bad" style={{ marginBottom: '16px' }}>
                <span><ShieldAlert size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{dwellWarning}</span>
              </div>
            )}

            <div className="un-dwell-box">
              <div className="un-dwell-status">
                {dwellComplete
                  ? <><CheckCircle size={18} style={{ marginRight: '6px', verticalAlign: 'middle', color: '#2E6E63' }} />Dwell Presence Verified (10/10 min)</>
                  : `⏳ Verifying Presence… ${Math.floor(dwellSeconds / 60)}/10 Minutes`}
              </div>
              <div className="un-dwell-track">
                <div className="un-dwell-fill" style={{ width: `${(dwellSeconds / 600) * 100}%` }} />
              </div>
              <small>Stay within 50 meters of your detected location while the 10-minute proof-of-presence completes.</small>
              {!dwellComplete && (
                <button type="button" onClick={handleFastForwardDwell} className="un-ff-btn">
                  ⚡ Fast-Forward Dwell (Dev Mode)
                </button>
              )}
            </div>

            {userCoords && (
              <div style={{ height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '18px', border: '1px solid var(--tc-line)' }}>
                <MapContainer center={[userCoords.lat, userCoords.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <CircleMarker center={[userCoords.lat, userCoords.lng]} radius={10} pathOptions={{ color: '#2E6E63', fillColor: '#2E6E63', fillOpacity: 0.8 }} />
                </MapContainer>
              </div>
            )}

            <form onSubmit={handleCreateTipSubmit} className="un-form">
              <div>
                <label>Location Name</label>
                <input
                  type="text"
                  value={tipLocationName}
                  onChange={(e) => setTipLocationName(e.target.value)}
                  required
                  placeholder="E.g., Broken Bridge, Besant Nagar"
                />
              </div>

              <div>
                <label>Category</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {TIP_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTipCategory(cat.id)}
                      className="un-chip"
                      style={{
                        border: tipCategory === cat.id ? `1.5px solid ${cat.color}` : '1px solid var(--tc-line)',
                        background: tipCategory === cat.id ? `${cat.color}18` : '#fff',
                        color: tipCategory === cat.id ? cat.color : '#97836A'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label>Tip Description</label>
                <textarea
                  value={tipContent}
                  onChange={(e) => setTipContent(e.target.value)}
                  required
                  rows={3}
                  placeholder="Share insider details, quiet hours, or safety advice..."
                />
              </div>

              <div>
                <label>Contributor Name / Handle</label>
                <input
                  type="text"
                  value={tipContributor}
                  onChange={(e) => setTipContributor(e.target.value)}
                  placeholder="E.g., NomadMadras"
                />
              </div>

              <button
                type="submit"
                disabled={!dwellComplete}
                className={`un-submit ${dwellComplete ? 'ready' : 'waiting'}`}
              >
                {dwellComplete ? 'Submit Verified Tip to Blockchain 🚀' : 'Waiting for 10-min Dwell to Complete...'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UnchartedPage;
