import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CurrencyWidget from '@/components/CurrencyWidget';
import TamilChatbot from '@/components/TamilChatbot';
import {Map, Wallet, MapPin, Calendar, Hotel, PartyPopper, CreditCard, IndianRupee, Target, CheckCircle, PieChart, ClipboardList, Award, AlertTriangle, ShieldAlert, Route, Clock, Navigation, X, Check, ShieldCheck, ArrowRightLeft} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BUDGET_OPTIONS = ['Budget', 'Moderate', 'Luxury'];

const TRAVEL_STYLES = [
  'Cultural & Heritage',
  'Adventure & Nature',
  'Relaxed & Leisure',
  'Foodie & Culinary',
  'Custom Explorer'
];

const ItineraryPage = () => {
  // Form State
  const [destination, setDestination] = useState('Chennai, Tamil Nadu');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState('Moderate');
  const [travelStyle, setTravelStyle] = useState('Cultural & Heritage');
  const [specialInterests, setSpecialInterests] = useState(
    'Kapaleeshwarar Temple, Marina Beach sunset, street food at T. Nagar, heritage walk at Fort St. George'
  );

  // UI & Response State
  const [loading, setLoading] = useState(false);
  const [itineraryResult, setItineraryResult] = useState(null);
  const [openDays, setOpenDays] = useState({ 1: true, 2: true });

  // Festivals State
  const [festivals, setFestivals] = useState([]);
  const [matchingFestivals, setMatchingFestivals] = useState([]);

  // Fetch festivals dataset on mount
  useEffect(() => {
    const loadFestivals = async () => {
      try {
        const res = await fetch('/data/festivals.json');
        if (res.ok) {
          const data = await res.json();
          setFestivals(data);
        }
      } catch (err) {
        console.warn('Could not fetch festivals.json:', err);
      }
    };
    loadFestivals();
  }, []);

  // Filter festivals matching the travel date range month(s)
  useEffect(() => {
    if (!festivals.length || !startDate || !endDate) return;

    const startM = new Date(startDate).getMonth() + 1; // 1-12
    const endM = new Date(endDate).getMonth() + 1;

    const travelMonths = new Set();
    if (!isNaN(startM) && !isNaN(endM)) {
      let curr = startM;
      while (true) {
        travelMonths.add(curr);
        if (curr === endM) break;
        curr = (curr % 12) + 1;
      }
    }

    const matched = festivals.filter((f) => travelMonths.has(f.month));
    setMatchingFestivals(matched);
  }, [festivals, startDate, endDate]);

  const toggleDay = (dayNum) => {
    setOpenDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Build festival injection text if matching festivals found
    let festivalPrompt = '';
    if (matchingFestivals.length > 0) {
      const festivalNamesStr = matchingFestivals
        .map((f) => `${f.name} (${f.tamil_name}) in ${f.district}`)
        .join(', ');
      festivalPrompt = ` Note: The trip coincides with the following Tamil Nadu festival(s): ${festivalNamesStr}. Please explicitly mention attending these festival celebrations in the itinerary.`;
    }

    const promptText = `Plan a ${budget} ${travelStyle} trip to ${destination} for ${travelers} traveler(s) from ${startDate} to ${endDate}. Special interests: ${specialInterests}.${festivalPrompt}`;

    try {
      let response;
      try {
        response = await fetch('http://localhost:5000/api/itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            destination,
            startDate,
            endDate,
            travelers,
            budget,
            travelStyle,
            specialInterests
          })
        });
      } catch (backendErr) {
        response = await fetch('/.netlify/functions/itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            destination,
            startDate,
            endDate,
            travelers,
            budget,
            travelStyle,
            specialInterests
          })
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        setItineraryResult(data);
      } else {
        throw new Error('Itinerary API endpoint unavailable');
      }
    } catch (err) {
      console.log('Using local AI itinerary generator fallback:', err);
      // Fallback generator for realistic Chennai trip output
      const fallbackData = buildFallbackItinerary(
        destination,
        startDate,
        endDate,
        travelers,
        budget,
        travelStyle,
        specialInterests
      );
      setItineraryResult(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="features-container">
      <div className="features-hero-bg">
        <Navbar />

        <section className="hero wrap" style={{ padding: '120px clamp(20px,5vw,48px) 40px clamp(20px,5vw,48px)', minHeight: '360px', display: 'flex', alignItems: 'center', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <div className="rv in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span className="pill" lang="ta" style={{ background: 'rgba(255,255,255,0.9)', color: '#B4451F', border: '1px solid #B4451F', fontWeight: 'bold' }}><i></i>பயணத் திட்டம்</span>
            <h1 style={{ fontFamily: '"Catamaran", "Noto Sans Tamil", sans-serif', fontWeight: 900, letterSpacing: '-0.02em', transform: 'scaleY(1.15)', transformOrigin: 'bottom left', color: 'var(--rust)', fontSize: 'clamp(4rem, 8vw, 7.5rem)', margin: '0.5rem 0 1rem 0', textShadow: '2px 2px 0px rgba(255,255,255,0.8)' }}>பயணத் திட்டம்</h1>
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
                பயணத் திட்டம் · AI Personalized Travel Odyssey
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderTop: '1px solid rgba(255, 215, 0, 0.2)', paddingTop: '1rem', width: '100%' }}>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <Calendar size={18} color="#FFD700" /> AI Scheduling
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <Map size={18} color="#FFD700" /> Smart Recommendations
                </span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <Wallet size={18} color="#FFD700" /> Budget Optimization
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ marginTop: '3rem', paddingBottom: '5rem' }}>
        <div className="itinerary-grid">
          {/* ── LEFT COLUMN: FORM & RESULTS ── */}
          <div className="left-column">
            {/* TRIP PLANNING FORM */}
            <form
              onSubmit={handleGenerate}
              style={{
                background: 'linear-gradient(145deg, #1c1c28, #14141c)',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                marginBottom: '3rem'
              }}
            >
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>
                Create Your Trip Itinerary
              </h2>
              <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                Fill in your travel preferences and let our AI assemble a tailored schedule.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Destination */}
                <div>
                  <label style={{ display: 'block', color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Dates Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Travelers Stepper & Travel Style */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                      Travelers
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                        style={{ width: '40px', height: '44px', background: 'transparent', border: 'none', color: '#FFD700', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                      <span style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>
                        {travelers}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTravelers((t) => t + 1)}
                        style={{ width: '40px', height: '44px', background: 'transparent', border: 'none', color: '#FFD700', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                      Travel Style
                    </label>
                    <select
                      value={travelStyle}
                      onChange={(e) => setTravelStyle(e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    >
                      {TRAVEL_STYLES.map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Budget Chips */}
                <div>
                  <label style={{ display: 'block', color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>
                    Budget Tier
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {BUDGET_OPTIONS.map((opt) => {
                      const selected = budget === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setBudget(opt)}
                          style={{
                            flex: 1,
                            padding: '0.65rem 1rem',
                            borderRadius: '8px',
                            border: selected ? '2px solid #FFD700' : '1px solid #33334d',
                            background: selected ? 'rgba(255, 215, 0, 0.15)' : '#1a1a26',
                            color: selected ? '#FFD700' : '#aaa',
                            fontWeight: selected ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '0.9rem'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Special Interests */}
                <div>
                  <label style={{ display: 'block', color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                    Special Interests & Must-See Places
                  </label>
                  <textarea
                    rows="3"
                    value={specialInterests}
                    onChange={(e) => setSpecialInterests(e.target.value)}
                    placeholder="E.g., Temples, street food, beaches, museums..."
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '0.5rem',
                    padding: '1rem 2rem',
                    background: loading ? '#555' : 'var(--accent, #FFD700)',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '1.05rem',
                    borderRadius: '50px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" /> Generating Itinerary...
                    </>
                  ) : (
                    'Generate Itinerary ✨'
                  )}
                </button>
              </div>
            </form>

            {/* FESTIVALS DURING YOUR TRIP SECTION */}
            {matchingFestivals.length > 0 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #1e1e2d, #14141f)',
                  border: '1px solid #FFD700',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  marginBottom: '3rem',
                  boxShadow: '0 8px 30px rgba(255, 215, 0, 0.15)'
                }}
              >
                <h3 style={{ fontSize: '1.6rem', color: '#FFD700', marginBottom: '0.4rem' }}>
                  <PartyPopper size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> Festivals During Your Trip ({matchingFestivals.length})
                </h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  These vibrant Tamil Nadu festivals take place during your selected travel dates and are included in your AI itinerary!
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {matchingFestivals.map((fest) => (
                    <div
                      key={fest.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1.2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>
                            {fest.name}
                          </h4>
                          <span style={{ background: 'rgba(255, 215, 0, 0.15)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.4)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                            <MapPin size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> {fest.district}
                          </span>
                        </div>

                        <div style={{ color: '#FFD700', fontSize: '0.85rem', fontFamily: "'Yatra One', cursive", marginBottom: '10px' }}>
                          {fest.tamil_name}
                        </div>

                        <p style={{ color: '#ccc', fontSize: '0.88rem', lineHeight: '1.45', margin: '0 0 12px 0' }}>
                          {fest.description}
                        </p>
                      </div>

                      <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #2ec4b6', fontSize: '0.82rem', color: '#2ec4b6', lineHeight: '1.4' }}>
                        💡 <strong>Travel Tip:</strong> {fest.travel_tip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ITINERARY RESULTS */}
            {itineraryResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {/* DAY CARDS */}
                <div>
                  <h3 style={{ fontSize: '1.8rem', color: '#FFD700', marginBottom: '1.25rem' }}>
                    <Calendar size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> Day-by-Day Schedule
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {itineraryResult.days.map((day) => {
                      const isOpen = !!openDays[day.dayNumber];
                      return (
                        <div
                          key={day.dayNumber}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            onClick={() => toggleDay(day.dayNumber)}
                            style={{
                              padding: '1.25rem 1.5rem',
                              background: 'rgba(255, 255, 255, 0.06)',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderBottom: isOpen ? '1px solid #282838' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ background: '#FFD700', color: '#000', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                Day {day.dayNumber}
                              </span>
                              <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{day.title}</h4>
                            </div>
                            <span style={{ color: '#FFD700', fontSize: '1.2rem', fontWeight: 'bold' }}>
                              {isOpen ? '▲' : '▼'}
                            </span>
                          </div>

                          {isOpen && (
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                              {day.activities.map((act, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                  <span style={{ minWidth: '85px', color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold', background: 'rgba(255,215,0,0.1)', padding: '4px 8px', borderRadius: '6px', textAlign: 'center' }}>
                                    {act.time}
                                  </span>
                                  <div>
                                    <h5 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '1rem' }}>{act.activity}</h5>
                                    <p style={{ color: '#aaa', margin: '0 0 6px 0', fontSize: '0.9rem', lineHeight: '1.5' }}>{act.description}</p>
                                    <span style={{ fontSize: '0.75rem', color: '#2ec4b6', background: 'rgba(46,196,182,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                      <MapPin size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> {act.location}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RECOMMENDED HOTELS GRID */}
                <div>
                  <h3 style={{ fontSize: '1.8rem', color: '#FFD700', marginBottom: '1.25rem' }}>
                    <Hotel size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> Recommended Stays
                  </h3>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '1.25rem'
                    }}
                  >
                    {itineraryResult.hotels.map((hotel, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '0.9rem' }}>★ {hotel.rating}</span>
                            <span style={{ background: '#222', color: '#ccc', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{hotel.tag}</span>
                          </div>
                          <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 4px 0' }}>{hotel.name}</h4>
                          <p style={{ color: '#aaa', fontSize: '0.85rem', margin: '0 0 10px 0' }}><MapPin size={22} style={{marginRight: "8px", verticalAlign: "middle", color: "#FFD700"}} /> {hotel.location}</p>
                        </div>
                        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{hotel.pricePerNight} <small style={{ color: '#888', fontWeight: 'normal', fontSize: '0.75rem' }}>/ night</small></span>
                          <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{hotel.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: CURRENCY WIDGET ── */}
          <div className="right-column">
            <CurrencyWidget />
          </div>
        </div>
      </div>

      {/* Embedded CSS for responsive 2-column grid and spinner */}
      <style>{`
        .itinerary-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: start;
        }

        @media (min-width: 768px) {
          .itinerary-grid {
            grid-template-columns: 1fr 320px !important;
          }
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <Footer />

      {/* Floating TamilChatbot Assistant */}
      <TamilChatbot floating={true} />
    </div>
  );
};

/**
 * Fallback AI Itinerary & Hotel Generator for Chennai & Tamil Nadu Trips
 */
function buildFallbackItinerary(destination, startDate, endDate, travelers, budget, travelStyle, specialInterests) {
  return {
    days: [
      {
        dayNumber: 1,
        title: 'Arrival & Mylapore Cultural Trail',
        activities: [
          {
            time: '09:00 AM',
            activity: 'Check-in & Morning Filter Coffee',
            description: 'Arrive at your hotel and savor traditional South Indian filter coffee at Rayar’s Mess in Mylapore.',
            location: 'Mylapore'
          },
          {
            time: '11:00 AM',
            activity: 'Kapaleeshwarar Temple Heritage Walk',
            description: 'Explore the 7th-century Dravidian architecture, gopuram sculptures, and sacred tank.',
            location: 'Kapaleeshwarar Temple, Mylapore'
          },
          {
            time: '04:30 PM',
            activity: 'Sunset Stroll at Elliot’s Beach',
            description: 'Relax by the Schmidt Memorial, enjoy fresh sundal, and feel the sea breeze at Besant Nagar.',
            location: 'Besant Nagar'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Colonial History & Culinary Discoveries',
        activities: [
          {
            time: '09:30 AM',
            activity: 'Fort St. George & Clive Building Museum',
            description: 'Discover the earliest British fortress in India and historic artifacts at the Fort Museum.',
            location: 'George Town'
          },
          {
            time: '01:00 PM',
            activity: 'Traditional Banana Leaf Feast',
            description: 'Indulge in an authentic Chettinad multi-course thali served on banana leaf at Murugan Idli Shop / Anjappar.',
            location: 'T. Nagar'
          },
          {
            time: '05:30 PM',
            activity: 'Shopping at Pondy Bazaar',
            description: 'Experience the vibrant silk sari shops, bronze handicrafts, and street markets.',
            location: 'T. Nagar'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Coastal Drive & UNESCO Shore Temples',
        activities: [
          {
            time: '08:30 AM',
            activity: 'Scenic East Coast Road (ECR) Drive',
            description: 'Drive along the Bay of Bengal coastline with stops at DakshinaChitra Heritage Village.',
            location: 'Muttukadu / ECR'
          },
          {
            time: '11:30 AM',
            activity: 'Mahabalipuram Monolithic Reliefs',
            description: 'Marvel at Arjuna’s Penance, Krishna’s Butterball, and the 8th-century Shore Temple.',
            location: 'Mahabalipuram'
          },
          {
            time: '06:00 PM',
            activity: 'Seafood Dinner & Farewell Sunset',
            description: 'Enjoy fresh coastal catch by the ocean before departing for Chennai.',
            location: 'ECR Beachfront'
          }
        ]
      }
    ],
    hotels: [
      {
        name: 'The Taj Connemara',
        location: 'Binny Road, Triplicane',
        pricePerNight: budget === 'Luxury' ? '12,500' : budget === 'Moderate' ? '7,200' : '4,800',
        rating: '4.8',
        tag: 'Heritage Luxury',
        type: 'Colonial Style'
      },
      {
        name: 'Residency Towers Chennai',
        location: 'Sir Thyagaraya Road, T. Nagar',
        pricePerNight: budget === 'Luxury' ? '9,800' : budget === 'Moderate' ? '5,400' : '3,600',
        rating: '4.6',
        tag: 'City Centre',
        type: 'Business & Leisure'
      },
      {
        name: 'Radisson Blu Resort Temple Bay',
        location: 'East Coast Road, Mahabalipuram',
        pricePerNight: budget === 'Luxury' ? '15,000' : budget === 'Moderate' ? '8,900' : '5,200',
        rating: '4.7',
        tag: 'Beachfront Resort',
        type: 'Coastal Getaway'
      }
    ]
  };
}

export default ItineraryPage;


