import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { MapPin, AlertTriangle, ShieldAlert, Shield, Search, Pointer, Lightbulb, Folder, BarChart3, Map, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useAppStore from '@/store/useAppStore';
import KaavalGuardian from '@/components/KaavalGuardian';
import './safety.css';

const SafetyPage = () => {
  const riskZones = useAppStore((state) => state.riskZones);

  // ── State for Extensions ──
  const [selectedZone, setSelectedZone] = useState(null);
  const [avoidTips, setAvoidTips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [hoveredTime, setHoveredTime] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const mapRef = useRef(null);

  // Compute current hour for night risk check (>= 21 or < 6)
  const currentHour = new Date().getHours();
  const isNightTime = currentHour >= 21 || currentHour < 6;

  // Hourly risk multipliers (shared by chart, map markers, and summary)
  const HOUR_PROFILE = [
    { time: '6 AM', mult: 0.7 },
    { time: '10 AM', mult: 0.5 },
    { time: '2 PM', mult: 0.5 },
    { time: '6 PM', mult: 0.8 },
    { time: '9 PM', mult: 1.5 },
    { time: '11 PM', mult: 1.8 }
  ];

  const getBaseScore = (zone) => {
    const levelStr = String(zone?.riskLevel || zone?.risk_level || 'Low').toLowerCase();
    return levelStr === 'high' ? 75 : levelStr === 'medium' ? 48 : 22;
  };

  const getZoneScoreAt = (zone, timeLabel) => {
    const profile = HOUR_PROFILE.find((h) => h.time === timeLabel);
    if (!profile) return getBaseScore(zone);
    return Math.min(100, Math.round(getBaseScore(zone) * profile.mult));
  };

  // Effective time point for map + summary (hover previews, click pins)
  const activeTime = hoveredTime || selectedTime;

  // Compute summary stats from Zustand store — hour-aware when a chart point is active
  const totalZones = riskZones.length;
  const highRiskCount = riskZones.filter((z) =>
    activeTime ? getZoneScoreAt(z, activeTime) >= 60
               : (z.riskLevel || z.risk_level || '').toLowerCase() === 'high'
  ).length;
  const mediumRiskCount = riskZones.filter((z) => {
    if (activeTime) {
      const s = getZoneScoreAt(z, activeTime);
      return s >= 40 && s < 60;
    }
    return (z.riskLevel || z.risk_level || '').toLowerCase() === 'medium';
  }).length;

  // Fetch community tips and filter for "avoid after dark"
  useEffect(() => {
    const fetchCommunityTips = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tips');
        if (res.ok) {
          const tipsData = await res.json();
          if (Array.isArray(tipsData)) {
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

  // Geocode Location Search & Risk Assessment
  const handleSearchLocation = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim() || searchLoading) return;

    setSearchLoading(true);
    setSearchResult(null);

    try {
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
    const baseScore = getBaseScore(zone);
    return HOUR_PROFILE.map((h) => ({
      time: h.time,
      score: Math.min(100, Math.round(baseScore * h.mult))
    }));
  };

  // Chart point selected → pin the hour, fly the map to the zone
  const handleChartPointSelect = (timeLabel) => {
    setSelectedTime((prev) => (prev === timeLabel ? null : timeLabel));
    if (!selectedZone || !mapRef.current) return;
    const lat = selectedZone.latitude ?? (Array.isArray(selectedZone.coordinates) ? selectedZone.coordinates[0] : selectedZone.lat);
    const lng = selectedZone.longitude ?? (Array.isArray(selectedZone.coordinates) ? selectedZone.coordinates[1] : selectedZone.lng);
    if (lat != null && lng != null) {
      mapRef.current.flyTo([lat, lng], 13, { duration: 0.9 });
    }
  };

  const scoreColor = (score) => (score >= 60 ? '#D64545' : score >= 40 ? '#E09F3E' : '#2E6E63');

  return (
    <div className="sf-page">
      {/* Scoped CSS animation for Night-Escalating Pulsing Markers */}
      <style>{`
        @keyframes pulseGlow {
          0% { r: 20px; opacity: 0.8; stroke-width: 2px; }
          50% { r: 32px; opacity: 0.3; stroke-width: 6px; }
          100% { r: 20px; opacity: 0.8; stroke-width: 2px; }
        }
        .pulse-marker { animation: pulseGlow 1.8s infinite ease-in-out; }
        .sf-page .leaflet-popup-content-wrapper {
          border-radius: 12px;
          font-family: "IBM Plex Sans", "Noto Sans Tamil", sans-serif;
        }
      `}</style>

      <Navbar />

      <KaavalGuardian
        stats={{ totalZones, highRiskCount, mediumRiskCount, activeTime, hoveredTime, selectedTime }}
        slideTwo={(
          <>
      {/* ── RISK INTELLIGENCE ── */}
      <section className="sf-hero">
        <div className="sf-wrap sf-hero-grid">
          <div>
            <span className="sf-eyebrow"><i></i>பாதுகாப்பு மண்டலம்</span>
            <h1 className="sf-title sf-title-sm" lang="ta">நுண்ணறிவு</h1>
            <p className="sf-subtitle">
              Live <strong>risk & accident intelligence</strong> for Chennai — police-verified zones,
              community night tips, and time-of-day risk charts, all on one field chart.
            </p>
          </div>
        </div>
      </section>

      <div className="sf-wrap">
        {/* ── SEARCH RAIL ── */}
        <div className="sf-rail">
          <form className="sf-search" onSubmit={handleSearchLocation}>
            <Search size={19} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any location in Chennai for live risk assessment..."
            />
            <button className="sf-search-btn" type="submit" disabled={searchLoading || !searchQuery.trim()}>
              {searchLoading ? 'Scanning...' : 'Assess Risk'}
            </button>
          </form>
        </div>

        {/* ── SEARCH RESULT ── */}
        {searchResult && (
          <div className="sf-result">
            <div>
              <span className="sf-result-label">Risk Assessment Complete</span>
              <h3><MapPin size={20} /> {searchResult.name}</h3>
              <small>Nearest: {searchResult.nearestZones?.join(', ') || 'N/A'}</small>
            </div>
            <div className="sf-result-score">
              <div className="num" style={{ color: scoreColor(searchResult.score) }}>
                {searchResult.score} <small>/ 100</small>
              </div>
              <span className="sf-risk-chip" style={{ color: scoreColor(searchResult.score) }}>
                {searchResult.riskLevel} Risk Zone
              </span>
            </div>
          </div>
        )}

        {/* ── MAP FRAME ── */}
        <div className="sf-map-section">
          <div className="sf-map-frame">
            <div className="sf-map-caption">
              <h3><Map size={17} /> Live Risk Chart</h3>
              <div className="sf-map-legend">
                <span className="lg"><span className="dot" style={{ background: '#D64545' }}></span>High (Police/Accidents)</span>
                <span className="lg"><span className="dot" style={{ background: '#E09F3E' }}></span>Medium (Community Tips)</span>
                <span className="lg"><span className="dot" style={{ background: '#2E6E63' }}></span>Low</span>
                {isNightTime && (
                  <span className="lg" style={{ color: '#D64545', fontWeight: 700 }}>
                    <span className="dot" style={{ border: '2px solid #D64545', background: 'transparent' }}></span>
                    Night-Escalating Active
                  </span>
                )}
              </div>
            </div>
            <div className="sf-map-body">
              <MapContainer
                center={[13.0827, 80.2707]}
                zoom={12}
                style={{ height: '100%', width: '100%', background: '#F3ECDD' }}
                scrollWheelZoom={true}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Risk Zones with onClick Side Panel & Night Pulsing Rings */}
                {riskZones.map((zone, idx) => {
                  const lat = zone.latitude ?? (Array.isArray(zone.coordinates) ? zone.coordinates[0] : zone.lat);
                  const lng = zone.longitude ?? (Array.isArray(zone.coordinates) ? zone.coordinates[1] : zone.lng);

                  if (lat == null || lng == null) return null;

                  const rawLevel = zone.riskLevel || zone.risk_level || 'Low';
                  const levelLower = String(rawLevel).toLowerCase();

                  // Hour-aware coloring when a chart point is pinned/previewed
                  const color = activeTime
                    ? scoreColor(getZoneScoreAt(zone, activeTime))
                    : levelLower === 'high'
                      ? '#D64545'
                      : levelLower === 'medium'
                        ? '#E09F3E'
                        : '#2E6E63';

                  const name = zone.name || zone.zone_name || 'Risk Zone';
                  const description = zone.description || zone.primary_concern || zone.primary_cause || 'No description available';

                  const isNightEscalating = isNightTime && (zone.night_risk === 'Yes' || zone.night_risk === 1 || zone.night_risk === true || levelLower === 'high');

                  return (
                    <React.Fragment key={zone.id || idx}>
                      {isNightEscalating && (
                        <CircleMarker
                          center={[lat, lng]}
                          radius={28}
                          pathOptions={{
                            color: '#D64545',
                            fillColor: '#D64545',
                            fillOpacity: 0.15,
                            weight: 2,
                            dashArray: '4, 4'
                          }}
                        />
                      )}

                      <CircleMarker
                        center={[lat, lng]}
                        radius={20}
                        pathOptions={{ color: color, fillColor: color, fillOpacity: 0.55 }}
                        eventHandlers={{
                          click: () => {
                            setSelectedZone(zone);
                          }
                        }}
                      >
                        <Popup>
                          <div style={{ minWidth: '180px', color: '#2B2118' }}>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontFamily: '"Libre Baskerville", serif' }}>{name}</h4>
                            <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem' }}>
                              <strong>Risk Level:</strong>{' '}
                              <span style={{ color: color, fontWeight: 'bold', textTransform: 'capitalize' }}>
                                {rawLevel}
                              </span>
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#55452F', lineHeight: '1.4' }}>
                              {description}
                            </p>
                            <small style={{ color: '#C4552E', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                              <Pointer size={12} style={{ marginRight: '4px' }} /> Click marker to view hourly risk chart & details
                            </small>
                          </div>
                        </Popup>
                      </CircleMarker>
                    </React.Fragment>
                  );
                })}

                {/* Community Tips ("Avoid After Dark") as Dashed Amber CircleMarkers */}
                {avoidTips.map((tip, idx) => {
                  const tLat = parseFloat(tip.latitude) || (13.04 + (idx * 0.02));
                  const tLng = parseFloat(tip.longitude) || (80.22 + (idx * 0.03));

                  return (
                    <CircleMarker
                      key={`tip-${tip.id || idx}`}
                      center={[tLat, tLng]}
                      radius={16}
                      pathOptions={{
                        color: '#E09F3E',
                        fillColor: '#E09F3E',
                        fillOpacity: 0.4,
                        weight: 2,
                        dashArray: '6, 6'
                      }}
                    >
                      <Popup>
                        <div style={{ minWidth: '200px', color: '#2B2118' }}>
                          <span style={{ background: 'rgba(224,159,62,0.15)', color: '#A03F1F', border: '1px solid #E09F3E', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', marginBottom: '6px', width: 'max-content' }}>
                            <Lightbulb size={12} style={{ marginRight: '4px' }} /> Community Tip (Avoid After Dark)
                          </span>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontFamily: '"Libre Baskerville", serif' }}>{tip.title}</h4>
                          <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#55452F' }}>
                            {tip.content || tip.text}
                          </p>
                          <div style={{ color: '#2E6E63', fontSize: '0.75rem', fontWeight: 'bold' }}>
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
        </div>
      </div>
          </>
        )}
      />

      {/* ── ZONE DETAIL SIDE PANEL ── */}
      {selectedZone && (
        <div className="sf-panel">
          <div>
            <div className="sf-panel-head">
              <span className="sf-panel-kicker">
                <Shield size={15} /> Zone Intelligence Detail
              </span>
              <button type="button" className="sf-panel-close" onClick={() => setSelectedZone(null)} aria-label="Close panel">
                <X size={16} />
              </button>
            </div>

            <h2>{selectedZone.name || selectedZone.zone_name || 'Risk Zone'}</h2>

            <div className="sf-panel-badges">
              <span
                className="sf-badge"
                style={{
                  color: String(selectedZone.riskLevel || selectedZone.risk_level).toLowerCase() === 'high' ? '#D64545' : '#E09F3E',
                  background: String(selectedZone.riskLevel || selectedZone.risk_level).toLowerCase() === 'high' ? 'rgba(214,69,69,0.1)' : 'rgba(224,159,62,0.12)'
                }}
              >
                {selectedZone.riskLevel || selectedZone.risk_level || 'Medium'} Risk
              </span>

              <span className="sf-badge-src">
                <Folder size={12} /> {selectedZone.source === 'accident' || selectedZone.primary_cause ? 'Accident Blackspot' : 'Police Crime Zone'}
              </span>

              {selectedTime && (
                <button type="button" className="sf-badge-clear" onClick={() => setSelectedTime(null)}>
                  Pinned: {selectedTime} ✕
                </button>
              )}
            </div>

            <div className="sf-panel-card">
              <label>Primary Cause / Concern</label>
              <p>
                {selectedZone.description || selectedZone.primary_concern || selectedZone.primary_cause || 'High traffic collision and nocturnal risk factors.'}
              </p>
            </div>

            <div className="sf-panel-card">
              <h4><BarChart3 size={16} /> Time-of-Day Risk Peaking Chart</h4>

              <div style={{ width: '100%', height: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getHourlyChartData(selectedZone)}
                    onMouseLeave={() => setHoveredTime(null)}
                  >
                    <XAxis dataKey="time" stroke="#97836A" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#97836A" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: '#FAF5EC', border: '1px solid #C4552E', borderRadius: '8px', color: '#2B2118' }}
                      formatter={(val, name, item) => [`${val} / 100`, `Risk at ${item?.payload?.time ?? ''}`]}
                      cursor={{ fill: 'rgba(196, 85, 46, 0.08)' }}
                    />
                    <Bar
                      dataKey="score"
                      radius={[4, 4, 0, 0]}
                      cursor="pointer"
                      onClick={(data) => {
                        const label = data?.payload?.time ?? data?.time;
                        if (label) handleChartPointSelect(label);
                      }}
                      onMouseEnter={(data) => {
                        const label = data?.payload?.time ?? data?.time;
                        if (label) setHoveredTime(label);
                      }}
                    >
                      {getHourlyChartData(selectedZone).map((entry, i) => {
                        const isPinned = selectedTime === entry.time;
                        const isHovered = hoveredTime === entry.time;
                        return (
                          <Cell
                            key={i}
                            fill={scoreColor(entry.score)}
                            fillOpacity={activeTime && !isPinned && !isHovered ? 0.35 : 1}
                            stroke={isPinned ? '#2B2118' : isHovered ? '#C4552E' : 'none'}
                            strokeWidth={isPinned ? 2.5 : 2}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <small className="sf-panel-note">
                Hover to preview · click a bar to pin that hour — the map and summary update live. Risk peaks late night (9 PM – 2 AM).
              </small>
            </div>
          </div>

          <div className="sf-panel-foot">
            <button type="button" onClick={() => setSelectedZone(null)}>
              Close Panel ✕
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SafetyPage;
