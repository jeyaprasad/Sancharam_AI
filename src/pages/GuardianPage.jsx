import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from '@/lib/router-compat';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useAppStore from '@/store/useAppStore';
import {
  createTripSession,
  updateTripPosition,
  subscribeToTripSession,
  updateTripStatus,
  generateTripId,
  isFirebaseConfigured
} from '@/services/firebase';

// Fix Leaflet marker icons in Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Activity, Check, Link2, MapPin, Phone, Route, ShieldCheck, Siren, Zap } from 'lucide-react';
import '@/pages/guardian-tracker.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

// Haversine formula helper (Distance in km)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371.0;
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

// Sample OSRM Route points for Chennai journey simulation (Koyambedu -> Marina Beach)
const SIMULATED_ROUTE_POINTS = [
  [13.0695, 80.1966], // Koyambedu
  [13.0725, 80.2010],
  [13.0760, 80.2080],
  [13.0790, 80.2150], // Anna Nagar
  [13.0820, 80.2220],
  [13.0840, 80.2300],
  [13.0850, 80.2450], // Central
  [13.0780, 80.2580],
  [13.0680, 80.2680], // Triplicane / Mylapore
  [13.0532, 80.2833]  // Marina Beach
];

const GuardianPage = ({ embedded = false }) => {
  const { tripId } = useParams(); // Public Live Tracking URL (/guardian/track/:tripId or /guardian/:tripId)
  const userLocation = useAppStore((state) => state.userLocation);
  const setUserLocation = useAppStore((state) => state.setUserLocation);
  const riskZones = useAppStore((state) => state.riskZones);

  // Section 1: Guardian Mode State
  const [isGuardianActive, setIsGuardianActive] = useState(false);
  const watchIdRef = useRef(null);
  const lastSavedTimeRef = useRef(0);

  // Section 2: Live Risk Indicator State
  const [riskData, setRiskData] = useState({
    score: 15,
    risk_level: 'Safe',
    hour: new Date().getHours(),
    nearby_zones_count: 0,
    nearest_zones: ['Koyambedu Bus Terminus', 'Anna Nagar', 'Kathipara']
  });
  const [lastRiskFetched, setLastRiskFetched] = useState(null);

  // Section 3: Emergency Contact State
  const [emergencyPhone, setEmergencyPhone] = useState(() => {
    return localStorage.getItem('guardian_emergency_phone') || '+919876543210';
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [shareSuccessToast, setShareSuccessToast] = useState(false);

  // Traveller Trip Session State
  const [activeTripId, setActiveTripId] = useState(() => generateTripId());
  const [isTripActive, setIsTripActive] = useState(false);
  const [tripStatus, setTripStatus] = useState('Active'); // Active, Alert, SOS, Arrived
  const [etaTime, setEtaTime] = useState('25 mins');
  const [destinationCoords] = useState({ lat: 13.0532, lng: 80.2833 }); // Marina Beach
  const [positionHistory, setPositionHistory] = useState([]);
  const [startTime, setStartTime] = useState(null);

  // 2-Second Press-and-Hold SOS Button State
  const [sosHoldProgress, setSosHoldProgress] = useState(0);
  const sosHoldTimerRef = useRef(null);
  const sosHoldStartRef = useRef(0);

  // Guardian Tracker Mode State
  const [trackerTripData, setTrackerTripData] = useState(null);
  const [alertsFeed, setAlertsFeed] = useState([
    { id: 1, text: 'Trip Session Initiated · Safe Route', time: '9:30 PM', ack: true },
    { id: 2, text: 'Entered Koyambedu terminus area · High Risk Zone', time: '9:40 PM', ack: false }
  ]);

  // Dev Journey Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const simIntervalRef = useRef(null);

  // ── 1. GEOLOCATION WATCHER (10-second updates) ──
  useEffect(() => {
    if (isGuardianActive) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(loc);
            lastSavedTimeRef.current = Date.now();
          },
          (err) => console.warn('Geolocation initial fetch error:', err),
          { enableHighAccuracy: true }
        );

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const now = Date.now();
            if (now - lastSavedTimeRef.current >= 10000 || !userLocation) {
              lastSavedTimeRef.current = now;
              const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setUserLocation(newLoc);

              // Update Firebase RTDB & Position History if Trip Active
              if (isTripActive) {
                updateTripPosition(activeTripId, newLoc);
                setPositionHistory((prev) => [...prev, [newLoc.lat, newLoc.lng]]);
                checkGeofenceAndDisarm(newLoc);
              }
            }
          },
          (err) => {
            console.warn('Geolocation watch error:', err);
            if (!userLocation) setUserLocation({ lat: 13.0695, lng: 80.1966 });
          },
          { enableHighAccuracy: true }
        );
      } else {
        setUserLocation({ lat: 13.0695, lng: 80.1966 });
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isGuardianActive, isTripActive, activeTripId, setUserLocation]);

  // ── 2. LIVE RISK SCORE POLLING (Every 30 seconds) ──
  useEffect(() => {
    const fetchRiskScore = async () => {
      const lat = userLocation?.lat ?? 13.0695;
      const lng = userLocation?.lng ?? 80.1966;
      const currentHour = new Date().getHours();

      try {
        const response = await fetch(
          `http://localhost:5000/api/risk-score?lat=${lat}&lng=${lng}&hour=${currentHour}`
        );
        if (response.ok) {
          const data = await response.json();
          setRiskData(data);
        } else {
          throw new Error('Risk API error');
        }
      } catch (err) {
        setRiskData({
          score: 25,
          risk_level: 'Low',
          hour: currentHour,
          nearby_zones_count: 1,
          nearest_zones: ['Koyambedu Bus Terminus', 'Anna Nagar', 'Kathipara']
        });
      } finally {
        setLastRiskFetched(new Date().toLocaleTimeString());
      }
    };

    fetchRiskScore();
    const interval = setInterval(fetchRiskScore, 30000);
    return () => clearInterval(interval);
  }, [userLocation]);

  // ── 3. FIREBASE RTDB SUBSCRIPTION FOR PUBLIC GUARDIAN TRACKER MODE (/guardian/track/:tripId) ──
  useEffect(() => {
    if (tripId) {
      const unsubscribe = subscribeToTripSession(tripId, (data) => {
        setTrackerTripData(data);
        if (data.status) setTripStatus(data.status);
        if (data.currentPosition) {
          setUserLocation({ lat: data.currentPosition.lat, lng: data.currentPosition.lng });
          setPositionHistory((prev) => [...prev, [data.currentPosition.lat, data.currentPosition.lng]]);
        }
      });
      return () => unsubscribe();
    }
  }, [tripId, setUserLocation]);

  // ── 4. AUTO-DISARM GEOFENCE CHECK (< 200m from destination) ──
  const checkGeofenceAndDisarm = (currentLoc) => {
    if (!currentLoc || !destinationCoords) return;
    const distKm = haversineDistance(
      currentLoc.lat,
      currentLoc.lng,
      destinationCoords.lat,
      destinationCoords.lng
    );

    if (distKm <= 0.2) {
      handleArrivedAtDestination();
    }

    riskZones.forEach((zone) => {
      const zLat = parseFloat(zone.latitude);
      const zLng = parseFloat(zone.longitude);
      if (!isNaN(zLat) && !isNaN(zLng)) {
        const zDist = haversineDistance(currentLoc.lat, currentLoc.lng, zLat, zLng);
        if (zDist <= 1.0) {
          const alertText = `Entered ${zone.name || zone.zone_name} area · High Risk Zone`;
          setAlertsFeed((prev) => {
            if (prev.some((a) => a.text === alertText)) return prev;
            return [
              {
                id: Date.now(),
                text: alertText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                ack: false
              },
              ...prev
            ];
          });
          setTripStatus('Alert');
          updateTripStatus(activeTripId, 'Alert');
        }
      }
    });
  };

  // ── 5. START / STOP TRAVELLER TRIP SESSION ──
  const handleStartTrip = async () => {
    const newTripId = generateTripId();
    setActiveTripId(newTripId);

    const startLoc = userLocation || { lat: 13.0695, lng: 80.1966 };
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setIsTripActive(true);
    setIsGuardianActive(true);
    setTripStatus('Active');
    setEtaTime('25 mins');
    setStartTime(nowTimeStr);

    const tripDocument = {
      tripId: newTripId,
      status: 'Active',
      contact: emergencyPhone,
      origin: startLoc,
      destination: destinationCoords,
      routeCoords: SIMULATED_ROUTE_POINTS,
      startTime: nowTimeStr,
      currentPosition: startLoc
    };

    await createTripSession(newTripId, tripDocument);
    await updateTripPosition(newTripId, startLoc);
    setPositionHistory([[startLoc.lat, startLoc.lng]]);
  };

  const handleArrivedAtDestination = async () => {
    setIsTripActive(false);
    setIsSimulating(false);
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setTripStatus('Arrived');
    await updateTripStatus(activeTripId, 'Arrived');
  };

  // ── 6. WEB SHARE API & TRACKER LINK GENERATOR ──
  const handleShareTrackerLink = async () => {
    const trackUrl = `${window.location.origin}/guardian/track/${activeTripId}`;
    const shareMessage = `🛡️ Live Sancharam Guardian Tracking Link: Follow my journey in real time at ${trackUrl}`;

    // 1. Try Native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sancharam Live Guardian Tracking',
          text: `Follow my live journey in real time:`,
          url: trackUrl
        });
        setShareSuccessToast(true);
        setTimeout(() => setShareSuccessToast(false), 3000);
        return;
      } catch (err) {
        console.log('Web Share dismissed or failed:', err);
      }
    }

    // 2. Fallback to Copy Clipboard + WhatsApp Deep Link
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackUrl);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    }

    const cleanPhone = emergencyPhone.replace(/[^\d+]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
  };

  // ── 7. 2-SECOND PRESS-AND-HOLD SOS BUTTON LOGIC ──
  const handleSosMouseDown = () => {
    sosHoldStartRef.current = Date.now();
    setSosHoldProgress(0);

    sosHoldTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - sosHoldStartRef.current;
      const pct = Math.min(100, (elapsed / 2000) * 100);
      setSosHoldProgress(pct);

      if (elapsed >= 2000) {
        clearInterval(sosHoldTimerRef.current);
        triggerSosAlert();
      }
    }, 50);
  };

  const handleSosMouseUp = () => {
    if (sosHoldTimerRef.current) {
      clearInterval(sosHoldTimerRef.current);
      sosHoldTimerRef.current = null;
    }
    if (sosHoldProgress < 100) {
      setSosHoldProgress(0);
    }
  };

  const triggerSosAlert = async () => {
    setTripStatus('SOS');
    await updateTripStatus(activeTripId, 'SOS');
    handleShareLocation();
  };

  // ── 8. DEV FEATURE: SIMULATE JOURNEY ──
  const handleSimulateJourney = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    const newTripId = generateTripId();
    setActiveTripId(newTripId);

    setIsSimulating(true);
    setIsTripActive(true);
    setIsGuardianActive(true);
    setTripStatus('Active');

    let idx = 0;
    simIntervalRef.current = setInterval(() => {
      if (idx < SIMULATED_ROUTE_POINTS.length) {
        const pt = SIMULATED_ROUTE_POINTS[idx];
        const newLoc = { lat: pt[0], lng: pt[1] };
        setUserLocation(newLoc);
        updateTripPosition(newTripId, newLoc);
        setPositionHistory((prev) => [...prev, pt]);
        checkGeofenceAndDisarm(newLoc);
        idx++;
      } else {
        clearInterval(simIntervalRef.current);
        setIsSimulating(false);
        handleArrivedAtDestination();
      }
    }, 1800);
  };

  // Existing Save & Share functions
  const handleSavePhone = (e) => {
    e.preventDefault();
    localStorage.setItem('guardian_emergency_phone', emergencyPhone);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleShareLocation = () => {
    const lat = userLocation?.lat ?? 13.0695;
    const lng = userLocation?.lng ?? 80.1966;
    const trackUrl = `${window.location.origin}/guardian/track/${activeTripId}`;
    const message = `EMERGENCY SOS ALERT! Guardian status: ${tripStatus}. Live GPS: https://maps.google.com/?q=${lat},${lng}. Track live journey: ${trackUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackUrl);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    }

    const cleanPhone = emergencyPhone.replace(/[^\d+]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Ring calculations
  const score = riskData?.score ?? 0;
  let ringColor = '#2E6E63';
  if (score > 60) ringColor = '#C4552E';
  else if (score >= 30) ringColor = '#B98A2E';


  const strokeWidth = 12;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (Math.min(100, score) / 100) * circumference;
  const currentLocCenter = [userLocation?.lat ?? 13.0695, userLocation?.lng ?? 80.1966];
  const isFbConfigured = isFirebaseConfigured();

  // ── IF RENDERED IN PUBLIC GUARDIAN TRACKER MODE (/guardian/track/:tripId or /guardian/:tripId) ──
  if (tripId) {
    return (
      <div className="features-container" style={{ background: '#0e0e17', minHeight: '100vh', color: '#fff' }}>
        <div className="features-hero-bg">
          <Navbar />

          <section className="hero wrap" style={{ paddingTop: '100px', minHeight: '240px' }}>
            <div className="rv in">
              <span className="pill" lang="ta"><i></i>நேரடி கண்காணிப்பு</span>
              <h1>Public Live <em>Guardian Tracker</em></h1>
              <p className="hero-sub" style={{ fontSize: '1.2rem', color: '#FFD700' }}>
                Tracking Session: <strong>{tripId}</strong> · No Login Required
              </p>
            </div>
          </section>
        </div>

        <div className="wrap" style={{ padding: '2rem' }}>
          {/* Status Header Bar */}
          <div
            style={{
              background: '#14141d',
              border: '1px solid #282838',
              borderRadius: '14px',
              padding: '1.25rem 1.75rem',
              marginBottom: '2rem',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <span style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase' }}>Trip Status</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: tripStatus === 'SOS' ? '#ff4d4d' : tripStatus === 'Alert' ? '#ff9800' : '#2ec4b6' }}>
                ● {tripStatus}
              </div>
            </div>

            <div>
              <span style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase' }}>Estimated Arrival</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#FFD700' }}>
                ⏳ {etaTime}
              </div>
            </div>

            <div>
              <span style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase' }}>Public Shared URL</span>
              <div style={{ color: '#2ec4b6', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {window.location.origin}/guardian/track/{tripId}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            {/* Main Full-Screen Leaflet Tracker Map */}
            <div style={{ height: '560px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #282838' }}>
              <MapContainer center={currentLocCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={SIMULATED_ROUTE_POINTS} pathOptions={{ color: '#3b82f6', weight: 5, dashArray: '6, 6' }} />
                {positionHistory.length > 0 && (
                  <Polyline positions={positionHistory} pathOptions={{ color: '#2ec4b6', weight: 4 }} />
                )}
                <Marker position={currentLocCenter}>
                  <Popup>
                    <strong>👤 Live Traveller Location</strong><br />
                    Lat: {currentLocCenter[0]}, Lng: {currentLocCenter[1]}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Live Alerts Feed Panel */}
            <div style={{ background: '#14141d', border: '1px solid #282838', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: '#FFD700', fontSize: '1.2rem', marginBottom: '1rem', fontFamily: "'Bebas Neue', cursive" }}>
                🔔 Live Geofence Alert Feed
              </h3>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {alertsFeed.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      background: alert.ack ? '#1a1a26' : 'rgba(255, 77, 77, 0.15)',
                      border: alert.ack ? '1px solid #33334d' : '1px solid #ff4d4d',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#aaa' }}>
                      <span>{alert.time}</span>
                      <span style={{ color: alert.ack ? '#2ec4b6' : '#ff4d4d', fontWeight: 'bold' }}>
                        {alert.ack ? '✓ Acknowledged' : '⚠️ Pending'}
                      </span>
                    </div>
                    <p style={{ color: '#fff', fontSize: '0.88rem', margin: '4px 0' }}>{alert.text}</p>
                    {!alert.ack && (
                      <button
                        type="button"
                        onClick={() => {
                          setAlertsFeed((prev) =>
                            prev.map((a) => (a.id === alert.id ? { ...a, ack: true } : a))
                          );
                        }}
                        style={{
                          alignSelf: 'flex-end',
                          background: '#2ec4b6',
                          color: '#000',
                          border: 'none',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TRAVELLER MODE VIEW (Default Page) ──
  return (
    <div className={embedded ? 'gtrk-embed' : 'features-container'}>
      {/* ── PERSISTENT TOP BANNER WHEN TRIP IS ACTIVE ── */}
      {isTripActive && (
        <div className={`gtrk-livebar${tripStatus === 'SOS' ? ' is-sos' : ''}`}>
          <div className="gtrk-livebar-info">
            <ShieldCheck size={15} strokeWidth={1.8} />
            Guardian active — sharing with {emergencyPhone} · ETA {etaTime}
          </div>
          <div className="gtrk-livebar-actions">
            <button type="button" onClick={handleShareTrackerLink} className="gtrk-livebar-btn">
              <Link2 size={13} strokeWidth={1.8} />
              Tracker link
            </button>
            <button type="button" onClick={handleArrivedAtDestination} className="gtrk-livebar-btn is-rust">
              <Check size={13} strokeWidth={2} />
              I've arrived
            </button>
          </div>
        </div>
      )}

      {/* ── HERO BANNER ── */}
      {!embedded && (
      <div className="features-hero-bg">
        <Navbar />

        <section className="hero wrap" style={{ paddingTop: '120px', minHeight: '340px' }}>
          <div className="rv in">
            <span className="pill" lang="ta"><i></i>பாதுகாவலன்</span>
            <h1 style={{ fontFamily: '"Catamaran", "Noto Sans Tamil", sans-serif', fontWeight: 900, letterSpacing: '-0.02em', transform: 'scaleY(1.15)', transformOrigin: 'bottom left' }}>பாதுகாவலன்</h1>
            <p className="hero-sub" style={{ fontSize: '1.3rem', color: 'var(--accent, #FFD700)', marginTop: '0.5rem', fontFamily: '"Tiro Tamil", "Vijaya", "Latha", serif', letterSpacing: '0.5px', whiteSpace: 'nowrap', display: 'inline-block' }}>
              பாதுகாவலன் · Live Location Watcher & Emergency Response
            </p>
          </div>
        </section>
      </div>
      )}

      <div className="wrap" style={{ padding: embedded ? '1.25rem 0 2rem 0' : '3rem 2rem 5rem 2rem' }}>
        {/* ── FIREBASE CONFIGURATION FALLBACK NOTICE BANNER ── */}
        {!embedded && !isFbConfigured && (
          <div
            style={{
              background: '#1a1a28',
              border: '1px solid #FFD700',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              color: '#ccc',
              fontSize: '0.88rem',
              lineHeight: '1.5'
            }}
          >
            <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '6px' }}>
              ℹ️ Firebase RTDB Setup Note:
            </div>
            Running in high-speed local memory sync mode. To persist live trip sessions in Firebase Realtime Database, create a <code>.env</code> file in your project root with:
            <pre style={{ background: '#111', color: '#2ec4b6', padding: '0.5rem 0.8rem', borderRadius: '6px', marginTop: '6px', fontSize: '0.8rem' }}>
{`VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id`}
            </pre>
          </div>
        )}

        <div className="gtrk">
          {/* ── TRIP SESSION BAR ── */}
          <div className="gtrk-bar">
            <div>
              <h3 className="gtrk-bar-title">
                <Route size={16} strokeWidth={1.6} />
                Live Guardian trip session
              </h3>
              <p className="gtrk-bar-sub">
                Share your live route with emergency contacts &amp; auto-disarm within 200m of your destination.
              </p>
            </div>

            <div className="gtrk-bar-actions">
              <button type="button" onClick={handleSimulateJourney} disabled={isSimulating} className="gtrk-btn gtrk-btn-ghost">
                <Zap size={14} strokeWidth={1.7} />
                {isSimulating ? 'Simulating journey…' : 'Simulate journey'}
              </button>

              {!isTripActive ? (
                <button type="button" onClick={handleStartTrip} className="gtrk-btn gtrk-btn-rust">
                  <ShieldCheck size={14} strokeWidth={1.7} />
                  Start active trip
                </button>
              ) : (
                <button type="button" onClick={handleShareTrackerLink} className="gtrk-btn gtrk-btn-green">
                  <Link2 size={14} strokeWidth={1.7} />
                  Share tracker link
                </button>
              )}
            </div>
          </div>

          {(copiedSuccess || shareSuccessToast) && (
            <div className="gtrk-toast">
              <Check size={14} strokeWidth={2} />
              Live tracker link copied — share menu opened.
            </div>
          )}

          {/* ── THREE PANELS ── */}
          <div className="gtrk-grid">
            {/* GUARDIAN MODE TOGGLE */}
            <div className={`gtrk-card${isGuardianActive ? ' is-active' : ''}`}>
              <div className="gtrk-card-head">
                <h3 className="gtrk-card-title">
                  <ShieldCheck size={16} strokeWidth={1.6} />
                  காவல் நிலை · Guardian mode
                </h3>
                <span className={`gtrk-tag${isGuardianActive ? ' is-on' : ''}`}>
                  {isGuardianActive ? 'Active watch' : 'Disarmed'}
                </span>
              </div>

              <p className="gtrk-copy">
                When Guardian mode is ON, Sancharam watches your live location in the background and refreshes your
                safety coordinates every 10 seconds.
              </p>

              <div className="gtrk-switch-row">
                <button
                  type="button"
                  onClick={() => setIsGuardianActive(!isGuardianActive)}
                  className={`gtrk-switch${isGuardianActive ? ' is-on' : ''}`}
                  aria-pressed={isGuardianActive}
                  aria-label="Toggle Guardian mode"
                >
                  <span />
                </button>
                <strong>{isGuardianActive ? 'Protection enabled' : 'Enable Guardian'}</strong>
              </div>

              <div className="gtrk-note">
                <MapPin size={13} strokeWidth={1.7} />
                <span className="gtrk-note-label">GPS</span>
                <span className="gtrk-mono">
                  {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Waiting for signal…'}
                </span>
              </div>
            </div>

            {/* LIVE RISK INDICATOR */}
            <div className="gtrk-card gtrk-card-center">
              <div className="gtrk-card-head">
                <h3 className="gtrk-card-title">
                  <Activity size={16} strokeWidth={1.6} />
                  நுண்ணறிவு · Live risk
                </h3>
                <span className="gtrk-meta">
                  30s {lastRiskFetched && `· ${lastRiskFetched}`}
                </span>
              </div>

              <div className="gtrk-ring">
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="90" cy="90" r={radius} stroke="#E4D8C2" strokeWidth={strokeWidth} fill="transparent" />
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
                  />
                </svg>
                <div className="gtrk-ring-label">
                  <span className="gtrk-score" style={{ color: ringColor }}>{score}</span>
                  <span className="gtrk-score-sub">{riskData?.risk_level ?? 'Safe'} risk</span>
                </div>
              </div>

              <p className="gtrk-nearest">
                <MapPin size={13} strokeWidth={1.7} />
                Nearest focus — {riskData?.nearest_zones?.[0] ?? 'Chennai Center'}
              </p>
            </div>

            {/* EMERGENCY SOS PANEL */}
            <div className="gtrk-card">
              <div className="gtrk-card-head">
                <h3 className="gtrk-card-title">
                  <Siren size={16} strokeWidth={1.6} />
                  அவசரம் · Emergency SOS
                </h3>
              </div>

              <form onSubmit={handleSavePhone} className="gtrk-form">
                <label className="gtrk-label" htmlFor="gtrk-phone">Emergency contact</label>
                <div className="gtrk-field">
                  <input
                    id="gtrk-phone"
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    required
                    placeholder="+91 98765 43210"
                    className="gtrk-input"
                  />
                  <button type="submit" className="gtrk-btn gtrk-btn-ghost">Save</button>
                </div>
                {savedSuccess && (
                  <span className="gtrk-saved"><Check size={12} strokeWidth={2} /> Contact saved on this device</span>
                )}
              </form>

              <div className="gtrk-stack">
                <button
                  type="button"
                  onMouseDown={handleSosMouseDown}
                  onMouseUp={handleSosMouseUp}
                  onMouseLeave={handleSosMouseUp}
                  onTouchStart={handleSosMouseDown}
                  onTouchEnd={handleSosMouseUp}
                  className={`gtrk-sos${tripStatus === 'SOS' ? ' is-firing' : ''}`}
                >
                  <span className="gtrk-sos-fill" style={{ width: `${sosHoldProgress}%` }} />
                  <span className="gtrk-sos-text">
                    <Siren size={15} strokeWidth={1.8} />
                    {sosHoldProgress > 0
                      ? `Hold SOS (${Math.round((2000 - (sosHoldProgress / 100) * 2000) / 100) / 10}s)…`
                      : 'Hold 2 seconds for SOS'}
                  </span>
                </button>

                <a href="tel:100" className="gtrk-btn gtrk-btn-line">
                  <Phone size={14} strokeWidth={1.7} />
                  Call police control · 100
                </a>

                <button type="button" onClick={handleShareTrackerLink} className="gtrk-btn gtrk-btn-green">
                  <Link2 size={14} strokeWidth={1.7} />
                  Share live tracker link
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {!embedded && <Footer />}
    </div>
  );
};

export default GuardianPage;
