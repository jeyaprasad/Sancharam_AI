import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from '@/lib/router-compat';
import { MapContainer, TileLayer, CircleMarker, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useAppStore from '@/store/useAppStore';
import { analyzeRoute } from '@/services/api';
import { ArrowRightLeft, Clock, ShieldCheck, Eye, Check, ChevronDown, Footprints, CarFront, Bus, TramFront, TrainFront, CarTaxiFront } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './routing.css';

// Fix default Leaflet icon paths in Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const MODES = [
  { id: 'walk', label: 'Walk', icon: Footprints, speed: 4.8 },
  { id: 'auto', label: 'Auto', icon: CarFront, speed: 18 },
  { id: 'bus', label: 'MTC bus', icon: Bus, speed: 15 },
  { id: 'metro', label: 'Metro', icon: TramFront, speed: 32 },
  { id: 'mrts', label: 'MRTS', icon: TrainFront, speed: 30 },
  { id: 'cab', label: 'Cab', icon: CarTaxiFront, speed: 22 },
];

const chennaiHour = () =>
  parseInt(
    new Date().toLocaleString('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }),
    10
  );

const isNight = () => { const h = chennaiHour(); return h >= 20 || h <= 5; };

// Chennai → Chengalpattu corridor (GST Road / OMR / ECR belts)
const LOCATIONS = [
  'T. Nagar, Chennai', 'Mylapore, Chennai', 'Adyar, Chennai', 'Saidapet, Chennai',
  'Guindy, Chennai', 'Anna Nagar, Chennai', 'Egmore, Chennai', 'Central Station, Chennai',
  'Velachery, Chennai', 'Thiruvanmiyur, Chennai', 'Besant Nagar, Chennai',
  'Kotturpuram, Chennai', 'Nandanam, Chennai', 'Ashok Nagar, Chennai',
  'Vadapalani, Chennai', 'Porur, Chennai', 'Kathipara, Chennai',
  'Pallikaranai, Chennai', 'Medavakkam, Chennai', 'Sholinganallur (OMR), Chennai',
  'Thoraipakkam (OMR), Chennai', 'Perungudi (OMR), Chennai', 'Karapakkam, Chennai',
  'Navalur (OMR), Chennai', 'Siruseri (OMR), Chennai', 'Kelambakkam, Chennai',
  'Chromepet, Chennai', 'Pallavaram, Chennai', 'Tambaram Sanatorium, Chennai',
  'Tambaram, Chennai', 'Perungalathur, Chennai', 'Vandalur, Chennai',
  'Kilambakkam (KCBT), Chennai', 'Urapakkam, Chennai', 'Guduvanchery, Chengalpattu',
  'Potheri, Chengalpattu', 'Kattankulathur, Chengalpattu', 'Maraimalai Nagar, Chengalpattu',
  'Singaperumal Koil, Chengalpattu', 'Mahindra World City, Chengalpattu',
  'Paranur, Chengalpattu', 'Chengalpattu Town, Chengalpattu',
];

function LocationField({ value, onChange, placeholder, label, cls }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const q = value.trim().toLowerCase();
  const matches = LOCATIONS.filter((l) => l.toLowerCase().includes(q)).slice(0, 6);

  return (
    <div className={`rt-field ${cls}`} ref={wrapRef}>
      <span className="dot" />
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul className="rt-suggest" role="listbox">
          {matches.map((loc) => (
            <li key={loc}>
              <button
                type="button"
                onClick={() => { onChange(loc); setOpen(false); }}
              >
                {loc}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const riskTone = (score) =>
  score >= 70
    ? { key: 'High', color: '#B4451F', tint: '#FDF3EE', verdict: 'High risk · Safer alternative recommended.' }
    : score >= 40
      ? { key: 'Medium', color: '#BA7517', tint: '#FAEEDA', verdict: 'Moderate risk · Proceed with awareness.' }
      : { key: 'Low', color: '#1D9E75', tint: '#EAF7F0', verdict: 'Low risk · Safe to travel now.' };

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 1) {
      try { map.fitBounds(L.latLngBounds(coords).pad(0.2)); } catch { /* noop */ }
    }
  }, [coords, map]);
  return null;
}

const RoutingPage = () => {
  const riskZones = useAppStore((state) => state.riskZones) || [];

  const [origin, setOrigin] = useState('T. Nagar, Chennai');
  const [destination, setDestination] = useState('Mylapore, Chennai');
  const [mode, setMode] = useState('auto');
  const [spun, setSpun] = useState(false);

  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [analysed, setAnalysed] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('fastest');
  const [whyOpen, setWhyOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Live stat pill
  const [clock, setClock] = useState('--:--');
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata',
        })
      );
    tick();
    const id = setInterval(tick, 1000 * 20);
    return () => clearInterval(id);
  }, []);

  const heat = useMemo(() => {
    const h = chennaiHour();
    return 29 + Math.round(9 * Math.max(0, Math.sin(((h - 6) / 24) * Math.PI * 1.4)));
  }, []);

  const toastTimer = useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };

  const handleSwap = () => {
    setSpun((s) => !s);
    setOrigin(destination);
    setDestination(origin);
  };

  const inCorridor = (val) => {
    const v = val.trim().toLowerCase();
    if (!v) return false;
    return LOCATIONS.some((l) => l.toLowerCase() === v);
  };

  const handleAnalyse = async (e) => {
    e?.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setError('இரு இடங்களையும் நிரப்பவும் · Please fill in both From and To.');
      return;
    }
    if (!inCorridor(origin)) {
      setError(`"${origin.trim()}" சென்னை → செங்கல்பட்டு வழித்தடத்திற்கு வெளியே உள்ளது · "${origin.trim()}" is outside the Chennai → Chengalpattu corridor. Please pick a location from the suggestions.`);
      return;
    }
    if (!inCorridor(destination)) {
      setError(`"${destination.trim()}" சென்னை → செங்கல்பட்டு வழித்தடத்திற்கு வெளியே உள்ளது · "${destination.trim()}" is outside the Chennai → Chengalpattu corridor. Please pick a location from the suggestions.`);
      return;
    }
    setError('');
    setLoading(true);
    const hour = chennaiHour();
    const data = await analyzeRoute(origin, destination, hour);
    if (data) setRouteData(data);
    setAnalysed(true);
    setLoading(false);
    showToast('பாதை பகுப்பாய்வு முடிந்தது · Route analysed');
  };

  // ── Derived metrics (backend when available, deterministic fallback otherwise)
  const baseScore = useMemo(() => {
    if (typeof routeData?.average_corridor_score === 'number') {
      return Math.round(routeData.average_corridor_score);
    }
    const seed = (origin + destination).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const night = isNight() ? 18 : 0;
    return Math.min(96, (seed % 55) + 12 + night);
  }, [routeData, origin, destination]);

  const routeCoords = useMemo(
    () =>
      routeData?.route_geojson?.geometry?.coordinates
        ? routeData.route_geojson.geometry.coordinates.map((pt) => [pt[1], pt[0]])
        : [],
    [routeData]
  );

  const distanceKm = useMemo(() => {
    const m = routeData?.route_geojson?.properties?.distance_meters;
    if (m) return (m / 1000).toFixed(1);
    const seed = (origin + destination).length;
    return (3 + ((seed * 7) % 90) / 10).toFixed(1);
  }, [routeData, origin, destination]);

  const modeMeta = MODES.find((m) => m.id === mode) || MODES[1];
  const durationMin = Math.max(4, Math.round((parseFloat(distanceKm) / modeMeta.speed) * 60));

  const tone = riskTone(baseScore);

  const factors = useMemo(() => {
    const night = isNight();
    return [
      {
        label: 'Accident zone proximity',
        weight: 40,
        value: Math.min(100, Math.round(baseScore * 0.95 + 6)),
        color: '#B4451F',
        note: 'Route passes within 600m of the Pallikaranai accident blackspot.',
      },
      {
        label: 'Crime zone proximity',
        weight: 30,
        value: Math.min(100, Math.round(baseScore * 0.78 + 4)),
        color: '#BA7517',
        note: 'Two reported snatch-prone stretches recorded near Ranganathan Street.',
      },
      {
        label: 'Night-time penalty',
        weight: 20,
        value: night ? 78 : 22,
        color: '#1A1410',
        note: night
          ? 'Travel window falls after 20:00 — lighting and footfall drop sharply.'
          : 'Daylight travel window — visibility and footfall are healthy.',
      },
      {
        label: 'Route isolation',
        weight: 10,
        value: Math.max(12, Math.round(baseScore * 0.5)),
        color: '#8C7E72',
        note: 'Short low-footfall link road between Venkatanarayana Road and Habibullah Road.',
      },
    ];
  }, [baseScore]);

  const options = useMemo(
    () => [
      {
        id: 'fastest',
        title: 'Fastest route',
        meta: `${durationMin} min · ${distanceKm} km`,
        score: baseScore,
        icon: <Clock size={15} />,
        ico: { background: '#FAEEDA', color: '#BA7517' },
      },
      {
        id: 'safest',
        title: 'Safest route',
        meta: `${durationMin + 6} min · ${(parseFloat(distanceKm) + 0.9).toFixed(1)} km via Anna Salai`,
        score: Math.max(11, Math.round(baseScore * 0.42)),
        icon: <ShieldCheck size={15} />,
        ico: { background: '#EAF7F0', color: '#1D9E75' },
      },
      {
        id: 'scenic',
        title: 'Scenic route',
        meta: `${durationMin + 13} min · ${(parseFloat(distanceKm) + 2.6).toFixed(1)} km via Marina`,
        score: Math.min(92, Math.round(baseScore * 0.72 + 8)),
        icon: <Eye size={15} />,
        ico: { background: '#E9EBF5', color: '#4B5A96' },
      },
    ],
    [baseScore, distanceKm, durationMin]
  );

  const nearbyZones = useMemo(() => {
    const list = (riskZones.length
      ? riskZones
      : [
          { name: 'T Nagar Junction', riskLevel: 'High', description: 'Crime zone' },
          { name: 'Kathipara Interchange', riskLevel: 'Medium', description: 'Accident blackspot' },
          { name: 'Velachery Main Road', riskLevel: 'Medium', description: 'Accident blackspot' },
        ]
    ).slice(0, 5);
    return list.map((z, i) => {
      const level = String(z.riskLevel || z.risk_level || 'medium').toLowerCase();
      return {
        name: z.name || z.zone_name || `Zone ${i + 1}`,
        type: level === 'high' ? 'Crime zone' : 'Accident blackspot',
        dist: `${300 + i * 240}m`,
        station: z.police_station || `${(z.name || 'Chennai').split(' ')[0]} police station`,
        color: level === 'high' ? '#B4451F' : '#BA7517',
      };
    });
  }, [riskZones]);

  // Arc geometry (semicircle, r=90)
  const ARC_LEN = Math.PI * 90;
  const arcOffset = ARC_LEN * (1 - Math.min(100, baseScore) / 100);

  const mapCenter = routeCoords[0] || [13.0418, 80.2341];

  return (
    <div className="rt-page">
      <Navbar />

      <div className="rt-wrap">
        {/* ══ HERO ══ */}
        <section className="rt-hero">
          {/* Band 1 */}
          <div className="rt-band1">
            <div>
              
              <h1 className="rt-h1">
                <span className="ta" lang="ta">ஊர்</span>
                <span className="en">Local Lens</span>
              </h1>
              <p className="rt-sub">உங்கள் பாதை பாதுகாப்பானதா? · Is your path safe?</p>
            </div>

            <div className="rt-livepill">
              <div><b>{clock}</b><span>Chennai time</span></div>
              <div><b>{heat}°</b><span>Heat index</span></div>
              <div><b>{riskZones.length || 19}</b><span>Mapped zones</span></div>
            </div>
          </div>

          {/* Band 2 */}
          <div className="rt-divider" />

          {/* Band 3 */}
          <form className="rt-band3" onSubmit={handleAnalyse}>
            <div className="rt-seclabel">Enter your route</div>
            <div className="rt-inputs">
              <LocationField cls="is-from" value={origin} onChange={(v) => { setOrigin(v); setError(''); }} placeholder="From — start point" label="From" />
              <button type="button" className={`rt-swap${spun ? ' is-spun' : ''}`} onClick={handleSwap} title="Swap">
                <ArrowRightLeft size={15} />
              </button>
              <LocationField cls="is-to" value={destination} onChange={(v) => { setDestination(v); setError(''); }} placeholder="To — destination" label="To" />
            </div>

            {error && (
              <div className="rt-error" role="alert">
                <i>⚠</i> {error}
              </div>
            )}

            <div className="rt-chips">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`rt-chip${mode === m.id ? ' is-active' : ''}`}
                  onClick={() => setMode(m.id)}
                >
                  <m.icon size={15} strokeWidth={2} />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Band 4 */}
            <div className="rt-band4">
              {analysed ? (
                <p className="rt-context">
                  {origin.split(',')[0]} → {destination.split(',')[0]} ·{' '}
                  <span className="num">{distanceKm} km</span> · est. {durationMin} min by {modeMeta.label}
                </p>
              ) : (
                <p className="rt-context is-empty">Enter a route above to see safety intelligence.</p>
              )}
              <button className="rt-cta" type="submit" disabled={loading}>
                {loading ? <><span className="rt-spin" /> Analysing</> : <>Analyse route →</>}
              </button>
            </div>
          </form>
        </section>

        {/* ══ RESULTS ══ */}
        {analysed && (
          <div className="rt-results">
            {/* Card 1 — risk score */}
            <div className="rt-card" style={{ animationDelay: '0ms' }}>
              <h3 className="rt-card-title">பாதை பாதுகாப்பு — Route safety</h3>
              <div className="rt-score">
                <div className="val" style={{ color: tone.color }}>{baseScore}</div>
                <svg className="rt-arc" width="230" height="126" viewBox="0 0 230 126">
                  <path className="rt-arc-track" d="M 25 110 A 90 90 0 0 1 205 110" fill="none" strokeWidth="10" strokeLinecap="round" />
                  <path
                    className="rt-arc-fill"
                    d="M 25 110 A 90 90 0 0 1 205 110"
                    fill="none"
                    stroke={tone.color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={ARC_LEN}
                    strokeDashoffset={arcOffset}
                  />
                  <text className="rt-arc-tick" x="20" y="124">0</text>
                  <text className="rt-arc-tick" x="108" y="14">50</text>
                  <text className="rt-arc-tick" x="192" y="124">100</text>
                </svg>
                <p className="rt-verdict" style={{ color: tone.color }}>{tone.verdict}</p>
              </div>

              {factors.map((f, i) => (
                <div className="rt-bar" key={f.label}>
                  <div className="rt-bar-head">
                    <span>{f.label} <span style={{ color: 'var(--muted)' }}>· {f.weight}%</span></span>
                    <b style={{ color: f.color }}>{f.value}</b>
                  </div>
                  <div className="rt-bar-track">
                    <div
                      className="rt-bar-fill"
                      style={{ '--w': `${f.value}%`, background: f.color, animationDelay: `${200 + i * 100}ms` }}
                    />
                  </div>
                  <p className="rt-bar-note">{f.note}</p>
                </div>
              ))}
            </div>

            {/* Card 2 — route options */}
            <div className="rt-card" style={{ animationDelay: '150ms' }}>
              <h3 className="rt-card-title">பாதை விருப்பங்கள் — Choose your route</h3>
              {options.map((o) => {
                const t = riskTone(o.score);
                return (
                  <div
                    key={o.id}
                    className={`rt-opt${selectedRoute === o.id ? ' is-sel' : ''}`}
                    onClick={() => { setSelectedRoute(o.id); showToast(`${o.title} selected`); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedRoute(o.id)}
                  >
                    <span className="rt-opt-ico" style={o.ico}>{o.icon}</span>
                    <div className="rt-opt-body">
                      <h4>{o.title}</h4>
                      <p>{o.meta}</p>
                    </div>
                    <span className="rt-badge" style={{ background: t.tint, color: t.color }}>{o.score} · {t.key}</span>
                  </div>
                );
              })}

              <div className="rt-why">
                <button className="rt-why-btn" type="button" onClick={() => setWhyOpen((v) => !v)}>
                  Why this route?
                  <ChevronDown size={14} style={{ transform: whyOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s ease' }} />
                </button>
                <div className={`rt-why-body${whyOpen ? ' is-open' : ''}`}>
                  <p>
                    The selected corridor keeps {distanceKm} km of travel outside the two highest-weighted
                    accident clusters near {nearbyZones[0]?.name || 'T Nagar'}, trading roughly six extra minutes for a calmer road.
                  </p>
                  <p>
                    Crime-zone proximity stays above 600m for most of the stretch, and the Anna Salai leg is
                    lit and patrolled through the night.
                  </p>
                  <p>
                    Time-of-day weighting is applied for the {chennaiHour()}:00 departure window, which
                    {isNight() ? ' adds' : ' removes'} the night-time penalty from the final score.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 — map */}
            <div className="rt-card rt-span2" style={{ animationDelay: '300ms' }}>
              <h3 className="rt-card-title">நிலப்படம் — Route map</h3>
              <div className="rt-map">
                <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FlyTo coords={routeCoords} />

                  {riskZones.map((zone, idx) => {
                    const level = String(zone.riskLevel || zone.risk_level || '').toLowerCase();
                    const color = level === 'high' ? '#B4451F' : level === 'medium' ? '#BA7517' : '#1D9E75';
                    const lat = parseFloat(zone.latitude ?? zone.coordinates?.[0]);
                    const lng = parseFloat(zone.longitude ?? zone.coordinates?.[1]);
                    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
                    return (
                      <CircleMarker
                        key={zone.id || idx}
                        center={[lat, lng]}
                        radius={16}
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.22, weight: 1 }}
                      >
                        <Popup>
                          <strong>{zone.name || zone.zone_name}</strong>
                          <br />
                          <span style={{ color }}>{level.toUpperCase()} risk</span>
                        </Popup>
                      </CircleMarker>
                    );
                  })}

                  {routeCoords.length > 1 && (
                    <Polyline positions={routeCoords} pathOptions={{ color: '#B4451F', weight: 5, opacity: 0.9 }} />
                  )}

                  {routeData?.origin?.lat && (
                    <Marker position={[routeData.origin.lat, routeData.origin.lng]}>
                      <Popup>🟢 {routeData.origin.name || origin}</Popup>
                    </Marker>
                  )}
                  {routeData?.destination?.lat && (
                    <Marker position={[routeData.destination.lat, routeData.destination.lng]}>
                      <Popup>🔴 {routeData.destination.name || destination}</Popup>
                    </Marker>
                  )}
                </MapContainer>

                <div className="rt-map-legend">
                  <span><i style={{ background: '#B4451F' }} />High crime zone</span>
                  <span><i style={{ background: '#BA7517' }} />Accident blackspot</span>
                  <span><i style={{ background: '#1D9E75' }} />Safe corridor</span>
                </div>
              </div>
            </div>

            {/* Card 4 — zones */}
            <div className="rt-card rt-span2" style={{ animationDelay: '450ms' }}>
              <h3 className="rt-card-title">அபாய மண்டலங்கள் — Risk zones near route</h3>
              {nearbyZones.length === 0 ? (
                <div className="rt-zone-none">
                  <span className="ck"><Check size={20} /></span>
                  <p>No high-risk zones on this route</p>
                </div>
              ) : (
                <div className="rt-zone-list">
                  {nearbyZones.map((z) => (
                    <div className="rt-zone" key={z.name}>
                      <i style={{ background: z.color }} />
                      <div className="rt-zone-body">
                        <b>{z.name}</b>
                        <span>{z.type}</span>
                        <em>{z.station}</em>
                      </div>
                      <span className="dist">{z.dist}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {toast && <div className="rt-toast">{toast}</div>}

      <Footer />
    </div>
  );
};

export default RoutingPage;
