import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { MapPin, Siren, MoonStar } from 'lucide-react';
import '@/pages/kaaval.css';

const GuardianTripTracker = lazy(() => import('@/pages/GuardianPage'));

const DIALS = [
  { emoji: '🚨', name: 'Police', num: '100', desc: 'Chennai city police control room', tint: 'rgba(196, 85, 46, 0.1)', accent: '#C4552E' },
  { emoji: '🏥', name: 'Ambulance', num: '108', desc: '108 emergency medical response', tint: 'rgba(46, 110, 99, 0.1)', accent: '#2E6E63' },
  { emoji: '👮', name: "Women's helpline", num: '1091', desc: 'Round-the-clock women in distress', tint: 'rgba(176, 122, 22, 0.12)', accent: '#8A6112' },
  { emoji: '🆘', name: 'National emergency', num: '112', desc: 'All-India single emergency number', tint: 'rgba(140, 106, 79, 0.12)', accent: '#8C6A4F' },
];

const STORE_KEY = 'sancharam.kaaval.guardian';
const LOG_KEY = 'sancharam.kaaval.alerts';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

// ── Validation with Tamil-first friendly messages ──
const validateName = (value) => {
  const v = value.trim();
  if (!v) return 'பெயரை உள்ளிடுங்கள் · Please enter a name';
  if (v.length < 2) return 'பெயர் மிகவும் சிறியது · Name is too short';
  if (v.length > 40) return 'பெயர் மிக நீளம் · Keep it under 40 characters';
  if (!/^[\p{L}\s.'-]+$/u.test(v)) return 'எழுத்துக்கள் மட்டும் பயன்படுத்துங்கள் · Letters only, please';
  return '';
};

const validatePhone = (value) => {
  const v = value.trim();
  if (!v) return 'தொலைபேசி எண் வேண்டும் · Phone number is needed';
  const digits = v.replace(/[^\d]/g, '');
  if (digits.length < 10) return 'சரியான 10 இலக்க எண் தேவை · Needs a valid 10-digit number';
  if (digits.length > 13) return 'எண் மிக நீளம் · That number looks too long';
  return '';
};

const KaavalGuardian = ({ stats, slideTwo }) => {
  const [page, setPage] = useState(0);
  const touchStartX = useRef(null);
  const slide1Ref = useRef(null);
  const slide2Ref = useRef(null);
  const [trackH, setTrackH] = useState(null);

  useEffect(() => {
    if (!slideTwo) return;
    const el = page === 0 ? slide1Ref.current : slide2Ref.current;
    if (!el) return;
    const measure = () => setTrackH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [page, slideTwo]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -50) setPage(1);
    else if (dx > 50) setPage(0);
  };
  const [now, setNow] = useState(() => new Date());
  const [guardian, setGuardian] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({ name: '', phone: '' });
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [editing, setEditing] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [fired, setFired] = useState(false);
  const [locating, setLocating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setGuardian(read(STORE_KEY, null));
    setAlerts(read(LOG_KEY, []));
    const h = new Date().getHours();
    setNightMode(h >= 21 || h < 5);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(t);
  }, [toast]);

  const hour = now.getHours();
  const isNight = hour >= 21 || hour < 5;
  const clock = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const onNameChange = (v) => {
    setName(v);
    if (touched.name) setErrors((e) => ({ ...e, name: validateName(v) }));
  };
  const onPhoneChange = (v) => {
    setPhone(v);
    if (touched.phone) setErrors((e) => ({ ...e, phone: validatePhone(v) }));
  };

  const submitGuardian = (e) => {
    e.preventDefault();
    const next = { name: validateName(name), phone: validatePhone(phone) };
    setErrors(next);
    setTouched({ name: true, phone: true });
    if (next.name || next.phone) return;
    const g = { name: name.trim(), phone: phone.trim() };
    setGuardian(g);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(g)); } catch { /* ignore */ }
    setToast(editing ? `Guardian updated · ${g.name}` : `Kaaval active · ${g.name} is watching over you`);
    setEditing(false);
    setTouched({ name: false, phone: false });
  };

  const startEdit = () => {
    setName(guardian.name);
    setPhone(guardian.phone);
    setErrors({ name: '', phone: '' });
    setTouched({ name: false, phone: false });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setErrors({ name: '', phone: '' });
  };

  // Reverse geocode a coordinate into a human place name
  const placeNameFor = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const a = data.address || {};
      return (
        a.neighbourhood || a.suburb || a.road || a.village || a.town || a.city_district ||
        a.city || (data.display_name ? data.display_name.split(',')[0] : null)
      );
    } catch {
      return null;
    }
  };

  const logAlert = async (lat, lng, accuracyNote) => {
    const gps = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const place = await placeNameFor(lat, lng);
    const entry = {
      at: new Date().toISOString(),
      gps,
      place: place || 'Location pinned',
      guardian: guardian ? guardian.name : 'No guardian saved',
      approx: !!accuracyNote,
    };
    setAlerts((prev) => {
      const next = [entry, ...prev].slice(0, 30);
      try { localStorage.setItem(LOG_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    setToast(`Alert logged · ${entry.place} · ${gps}`);
    setLocating(false);
  };

  const triggerSOS = () => {
    setFired(true);
    setLocating(true);
    setToast('Locating you… அமைதியாக இருங்கள்');
    setTimeout(() => setFired(false), 2600);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => logAlert(pos.coords.latitude, pos.coords.longitude),
        () => logAlert(13.0827, 80.2707, 'approx'),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    } else {
      logAlert(13.0827, 80.2707, 'approx');
    }
  };

  const clearLog = () => {
    setAlerts([]);
    try { localStorage.removeItem(LOG_KEY); } catch { /* ignore */ }
  };

  const fmt = (iso) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const guardianForm = (
    <form className="kv-setup-row" onSubmit={submitGuardian} noValidate>
      <div className="kv-field">
        <input
          className={`kv-input${errors.name ? ' has-error' : ''}`}
          placeholder="Guardian name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={() => { setTouched((t) => ({ ...t, name: true })); setErrors((er) => ({ ...er, name: validateName(name) })); }}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="kv-error">{errors.name}</p>}
      </div>
      <div className="kv-field">
        <input
          className={`kv-input kv-mono${errors.phone ? ' has-error' : ''}`}
          placeholder="Phone number"
          inputMode="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          onBlur={() => { setTouched((t) => ({ ...t, phone: true })); setErrors((er) => ({ ...er, phone: validatePhone(phone) })); }}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && <p className="kv-error">{errors.phone}</p>}
      </div>
      <button className="kv-btn-rust" type="submit">
        {editing ? 'Update guardian →' : 'Enable Kaaval →'}
      </button>
      {editing && (
        <button className="kv-chip" type="button" onClick={cancelEdit}>Cancel</button>
      )}
    </form>
  );

  return (
    <div className="kv">
      {/* ── HERO ── */}
      <section className="kv-hero">
        <div className="kv-band1">
          <div>
            <span className="kv-eyebrow"><i /><span lang="ta">தனி பயண பாதுகாப்பு</span> · Solo safety mode</span>
            <h1 className="kv-h1">
              <span className="ta" lang="ta">காவல்</span>
              
            </h1>
            <p className="kv-tagline">
              தனியாக பயணி. பாதுகாப்பாக திரும்பு. · Travel alone. Return safe.
            </p>
            <p className="kv-hero-desc">
              Start a live trip session and Sancharam becomes your silent companion —
              sharing your route with people you trust, watching risk zones as you move,
              and keeping one-tap SOS within reach, day or night.
            </p>
          </div>
          <div className="kv-livepill">
            <div><b>{stats?.totalZones ?? 0}</b><small>Total Zones</small></div>
            <div className="is-high"><b>{stats?.highRiskCount ?? 0}</b><small>High Risk</small></div>
            <div className="is-med"><b>{stats?.mediumRiskCount ?? 0}</b><small>Medium Risk</small></div>
            {stats?.activeTime && (
              <div><b>{stats.activeTime}</b><small>{stats.hoveredTime ? 'Previewing' : 'Pinned'}</small></div>
            )}
          </div>
        </div>

        <div className="kv-divider" />

      </section>

      {/* ── SWIPE PAGES: dots + carousel ── */}
      {slideTwo && (
        <div className="kv-pagenav" role="tablist" aria-label="Kaaval pages">
          <button
            type="button"
            role="tab"
            aria-selected={page === 0}
            className={`kv-pagetab${page === 0 ? ' is-active' : ''}`}
            onClick={() => setPage(0)}
          >
            <span className="kv-pagetab-icon">🛡</span>
            <span className="kv-pagetab-text">
              <span className="kv-pagetab-ta" lang="ta">காவல்</span>
              <span className="kv-pagetab-en">Guardian</span>
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={page === 1}
            className={`kv-pagetab${page === 1 ? ' is-active' : ''}`}
            onClick={() => setPage(1)}
          >
            <span className="kv-pagetab-icon">🗺</span>
            <span className="kv-pagetab-text">
              <span className="kv-pagetab-ta" lang="ta">நுண்ணறிவு</span>
              <span className="kv-pagetab-en">Risk Intel</span>
            </span>
          </button>
        </div>
      )}
      {slideTwo && (
        <div
          className="kv-carousel"
          style={trackH ? { height: trackH } : undefined}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="kv-carousel-track" style={{ transform: `translateX(-${page * 100}%)` }}>
            <div className="kv-slide" ref={slide1Ref}>
              <section className="sf-hero">
                <div className="sf-wrap sf-hero-grid">
                  <div>
                    
                    <h1 className="sf-title sf-title-sm" lang="ta">காவல்</h1>
                    <p className="sf-subtitle">
                      Your <strong>personal guardian console</strong> — one-tap SOS, quick-dial
                      emergency lines, and night-watch intelligence, all in one place.
                    </p>
                  </div>
                </div>
              </section>
              {/* ── LIVE TRIP TRACKING (Guardian trip session) ── */}
              <section className="kv-tracker-section">
                <Suspense fallback={<p className="kv-none">Loading trip tracker…</p>}>
                  <GuardianTripTracker embedded />
                </Suspense>
              </section>
            </div>
            <div className="kv-slide" ref={slide2Ref}>
              {slideTwo}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="kv-toast">{toast}</div>}
    </div>
  );
};

export default KaavalGuardian;
