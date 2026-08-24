import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
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

const GuardianPage = () => {
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
  let ringColor = '#2ec4b6';
  if (score > 60) ringColor = '#ff4d4d';
  else if (score >= 30) ringColor = '#ffd700';

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
          <header>
            <div className="nav-in">
              <Link to="/" className="logo-img-link">
                <img src="/assets/images/icon.png" alt="Sancharam Logo" className="nav-logo-img" />
              </Link>
              <nav>
                <Link to="/">Home</Link>
                <Link to="/features">Features</Link>
                <Link to="/features/blockchain" aria-current="page">Guardian Tracker</Link>
              </nav>
            </div>
          </header>

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
    <div className="features-container">
      {/* ── PERSISTENT TOP BANNER WHEN TRIP IS ACTIVE ── */}
      {isTripActive && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            background: tripStatus === 'SOS' ? '#ff4d4d' : 'linear-gradient(90deg, #1e1e2d, #14141f)',
            color: tripStatus === 'SOS' ? '#fff' : '#FFD700',
            borderBottom: '2px solid #FFD700',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            zIndex: 10000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
            🛡️ Guardian active — sharing with {emergencyPhone} · ETA {etaTime}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleShareTrackerLink}
              style={{
                background: '#2ec4b6',
                color: '#000',
                border: 'none',
                padding: '5px 14px',
                borderRadius: '14px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔗 Tracker Link
            </button>

            <button
              type="button"
              onClick={handleArrivedAtDestination}
              style={{
                background: '#FFD700',
                color: '#000',
                border: 'none',
                padding: '5px 14px',
                borderRadius: '14px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              I've Arrived ✅
            </button>
          </div>
        </div>
      )}

      {/* ── HERO BANNER ── */}
      <div className="features-hero-bg">
        <header>
          <div className="nav-in">
            <Link to="/" className="logo-img-link">
              <img src="/assets/images/icon.png" alt="Sancharam Logo" className="nav-logo-img" />
            </Link>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/features">Features</Link>
              <Link to="/features/blockchain" aria-current="page">Guardian</Link>
              <Link to="/features/safety">Safety</Link>
            </nav>
          </div>
        </header>

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

      <div className="wrap" style={{ padding: '3rem 2rem 5rem 2rem' }}>
        {/* ── FIREBASE CONFIGURATION FALLBACK NOTICE BANNER ── */}
        {!isFbConfigured && (
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

        {/* ── DEV SIMULATION & TRIP CONTROLS BAR ── */}
        <div
          style={{
            background: '#14141d',
            border: '1px solid #FFD700',
            borderRadius: '16px',
            padding: '1.25rem 1.75rem',
            marginBottom: '2.5rem',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 8px 25px rgba(255, 215, 0, 0.15)'
          }}
        >
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 4px 0', fontFamily: "'Bebas Neue', cursive" }}>
              🚀 Live Guardian Trip Session ({activeTripId})
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>
              Share your live route with emergency contacts & auto-disarm within 200m of destination.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleSimulateJourney}
              disabled={isSimulating}
              style={{
                background: isSimulating ? '#555' : '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '50px',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                cursor: isSimulating ? 'not-allowed' : 'pointer'
              }}
            >
              {isSimulating ? 'Simulating Journey...' : '⚡ Simulate Journey (Dev Demo)'}
            </button>

            {!isTripActive ? (
              <button
                type="button"
                onClick={handleStartTrip}
                style={{
                  background: 'var(--accent, #FFD700)',
                  color: '#000',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '50px',
                  fontWeight: 'bold',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Start Active Trip 🛡️
              </button>
            ) : (
              <button
                type="button"
                onClick={handleShareTrackerLink}
                style={{
                  background: '#2ec4b6',
                  color: '#000',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '50px',
                  fontWeight: 'bold',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                🔗 Share Tracker Link
              </button>
            )}
          </div>
        </div>

        {(copiedSuccess || shareSuccessToast) && (
          <div style={{ background: 'rgba(46, 196, 182, 0.15)', border: '1px solid #2ec4b6', color: '#2ec4b6', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
            ✓ Live Tracker Link Copied & Web Share Menu Opened!
          </div>
        )}

        {/* ── EXISTING THREE PANELS GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* SECTION 1: GUARDIAN MODE TOGGLE */}
          <div
            style={{
              background: '#14141d',
              border: isGuardianActive ? '2px solid #2ec4b6' : '1px solid #282838',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              boxShadow: isGuardianActive ? '0 0 25px rgba(46, 196, 182, 0.2)' : '0 8px 30px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: 0, fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
                  🛡️ Guardian Mode
                </h3>
                <span
                  style={{
                    background: isGuardianActive ? 'rgba(46, 196, 182, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: isGuardianActive ? '#2ec4b6' : '#888',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {isGuardianActive ? 'ACTIVE WATCH' : 'DISARMED'}
                </span>
              </div>

              <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                When Guardian Mode is turned ON, Sancharam monitors your live location in the background, updating your safety coordinates every 10 seconds.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsGuardianActive(!isGuardianActive)}
                  style={{
                    width: '80px',
                    height: '42px',
                    borderRadius: '50px',
                    background: isGuardianActive ? '#2ec4b6' : '#333345',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease',
                    boxShadow: isGuardianActive ? '0 0 15px rgba(46, 196, 182, 0.5)' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '4px',
                      left: isGuardianActive ? '42px' : '4px',
                      transition: 'left 0.3s ease',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                    }}
                  />
                </button>
                <span style={{ color: isGuardianActive ? '#fff' : '#aaa', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {isGuardianActive ? 'Protection Enabled' : 'Enable Guardian'}
                </span>
              </div>
            </div>

            <div style={{ background: '#1a1a28', padding: '1rem', borderRadius: '10px', fontSize: '0.85rem', color: '#ccc' }}>
              <strong style={{ color: '#FFD700' }}>GPS Coordinates:</strong>{' '}
              {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Waiting for GPS signal...'}
            </div>
          </div>

          {/* SECTION 2: LIVE RISK INDICATOR */}
          <div
            style={{
              background: '#14141d',
              border: '1px solid #282838',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justify: 'space-between',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: 0, fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
                  ⚡ Live Risk Indicator
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#777' }}>
                  Auto-updates 30s {lastRiskFetched && `(${lastRiskFetched})`}
                </span>
              </div>

              <div style={{ position: 'relative', width: '180px', height: '180px', margin: '1.5rem auto' }}>
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="90" cy="90" r={radius} stroke="#222233" strokeWidth={strokeWidth} fill="transparent" />
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
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justify: 'center'
                  }}
                >
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: ringColor, lineHeight: 1 }}>
                    {score}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
                    {riskData?.risk_level ?? 'Safe'} Risk
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#ccc', textAlign: 'center' }}>
                <strong>Nearest Focus:</strong> {riskData?.nearest_zones?.[0] ?? 'Chennai Center'}
              </div>
            </div>
          </div>

          {/* SECTION 3: EMERGENCY CONTACTS PANEL WITH 2-SECOND SOS PRESS-AND-HOLD */}
          <div
            style={{
              background: '#14141d',
              border: '1px solid #282838',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px' }}>
                🚨 Emergency SOS Panel
              </h3>

              <form onSubmit={handleSavePhone} style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                  Saved Emergency Contact Phone
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    required
                    placeholder="+91 98765 43210"
                    style={{
                      flex: 1,
                      padding: '0.7rem 0.9rem',
                      background: '#1a1a26',
                      border: '1px solid #33334d',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.7rem 1rem',
                      background: '#33334d',
                      color: '#FFD700',
                      border: '1px solid #555577',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                </div>
                {savedSuccess && (
                  <span style={{ color: '#2ec4b6', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    ✓ Contact saved to localStorage!
                  </span>
                )}
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onMouseDown={handleSosMouseDown}
                    onMouseUp={handleSosMouseUp}
                    onMouseLeave={handleSosMouseUp}
                    onTouchStart={handleSosMouseDown}
                    onTouchEnd={handleSosMouseUp}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: tripStatus === 'SOS' ? '#ff1a1a' : '#ff4d4d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      boxShadow: '0 4px 15px rgba(255, 77, 77, 0.4)',
                      position: 'relative',
                      overflow: 'hidden',
                      userSelect: 'none'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${sosHoldProgress}%`,
                        background: 'rgba(255, 255, 255, 0.35)',
                        transition: 'width 0.05s linear'
                      }}
                    />
                    <span style={{ position: 'relative', zIndex: 2 }}>
                      {sosHoldProgress > 0 ? `HOLD SOS (${Math.round((2000 - (sosHoldProgress / 100) * 2000) / 1000 * 10) / 10}s)...` : '🚨 HOLD 2 SECONDS FOR EMERGENCY SOS'}
                    </span>
                  </button>
                </div>

                <a
                  href="tel:100"
                  style={{
                    padding: '0.85rem',
                    background: '#33334d',
                    color: '#fff',
                    textAlign: 'center',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  📞 Call Police Control (100)
                </a>

                <button
                  type="button"
                  onClick={handleShareTrackerLink}
                  style={{
                    padding: '0.85rem',
                    background: '#2ec4b6',
                    color: '#000',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  🔗 Share Live Tracker Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GuardianPage;
