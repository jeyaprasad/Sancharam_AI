import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './ItineraryPage.css';
import { MapPin, Calendar, Clock, Navigation, Check, ChevronDown, ChevronUp, Sun, Sunrise, Droplets, ArrowRight, Printer, Save, X, Activity, Feather, Search, Utensils, Zap, Camera, PartyPopper, Sparkles, Thermometer, Map, RefreshCw, Star, Footprints, Car, Bus, Train, TrainFront } from 'lucide-react';

const MOODS = [
  { id: 'calm', name: 'Calm', ta: 'அமைதி', icon: <Feather size={24} strokeWidth={1.5} />, bg: '#EAF7F0', accent: '#1D9E75', color: '#1D9E75', desc: 'Quiet temples, peaceful beaches, serene parks.' },
  { id: 'curious', name: 'Curious', ta: 'ஆர்வம்', icon: <Search size={24} strokeWidth={1.5} />, bg: '#E1F5EE', accent: '#0F6E56', color: '#0F6E56', desc: 'Museums, heritage walks, local history.' },
  { id: 'hungry', name: 'Hungry', ta: 'பசி', icon: <Utensils size={24} strokeWidth={1.5} />, bg: '#FAECE7', accent: '#D85A30', color: '#D85A30', desc: 'Street food, iconic messes, fine dining.' },
  { id: 'adventurous', name: 'Adventurous', ta: 'துணிவு', icon: <Zap size={24} strokeWidth={1.5} />, bg: '#FAEEDA', accent: '#854F0B', color: '#854F0B', desc: 'Surfing, theme parks, bustling markets.' },
  { id: 'nostalgic', name: 'Nostalgic', ta: 'நினைவு', icon: <Camera size={24} strokeWidth={1.5} />, bg: '#EEEDFE', accent: '#534AB7', color: '#534AB7', desc: 'Old Madras charm, vintage cafes, classic spots.' },
  { id: 'celebratory', name: 'Celebratory', ta: 'கொண்டாட்டம்', icon: <PartyPopper size={24} strokeWidth={1.5} />, bg: '#FAEEDA', accent: '#BA7517', color: '#BA7517', desc: 'Shopping, high-energy spots, nightlife.' },
];

const TRANSPORT = [
  { id: 'walk', icon: <Footprints size={16} />, label: 'Walk' },
  { id: 'auto', icon: <Car size={16} />, label: 'Auto' },
  { id: 'bus', icon: <Bus size={16} />, label: 'MTC bus' },
  { id: 'metro', icon: <Train size={16} />, label: 'Metro' },
  { id: 'mrts', icon: <TrainFront size={16} />, label: 'MRTS' },
  { id: 'cab', icon: <Car size={16} />, label: 'Cab' },
];

const BUDGETS = [
  { id: 'budget', label: '₹ Budget' },
  { id: 'mid', label: '₹₹ Mid' },
  { id: 'luxury', label: '₹₹₹ Luxury' },
];

const ItineraryPage = () => {
  // State
  const [selectedMood, setSelectedMood] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [travellers, setTravellers] = useState(2);
  const [budget, setBudget] = useState('mid');
  const [transport, setTransport] = useState(['metro', 'cab']);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [planType, setPlanType] = useState('A'); // A or B
  const [openDays, setOpenDays] = useState({ 1: true });

  const toggleTransport = (id) => {
    setTransport(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!selectedMood) {
      alert("Please select a mood first!");
      return;
    }
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      setResults(generateMockData(selectedMood, budget, travellers));
      setLoading(false);
      setTimeout(() => {
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 2500);
  };

  const toggleDay = (dayId) => {
    setOpenDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  // Current Time logic
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const getTimeContext = () => {
    const hour = now.getHours();
    let timeSlot = "";
    let message = "";
    let outdoorWindow = "Good";

    if (hour >= 5 && hour <= 10) {
      timeSlot = "Morning";
      message = "Perfect cool weather for outdoor exploration. This is your best window.";
      outdoorWindow = "Ideal";
    } else if (hour >= 11 && hour <= 16) {
      timeSlot = "Peak Heat";
      message = "Afternoon heat is peaking. Indoor or shaded activities highly recommended.";
      outdoorWindow = "Avoid";
    } else if (hour >= 17 && hour <= 20) {
      timeSlot = "Evening";
      message = "Golden hour. This is your best window for outdoor activities.";
      outdoorWindow = "Ideal";
    } else {
      timeSlot = "Night";
      message = "Late hours. Prioritizing well-lit areas and safe transport.";
      outdoorWindow = "Fair";
    }

    return { timeSlot, message, outdoorWindow };
  };
  const timeContext = getTimeContext();

  return (
    <div className="features-container">
      {/* Loading Overlay */}
      {loading && (
        <div className="mood-loading-overlay">
          <div className="spinner-ring"></div>
          <h2 className="loading-title">Building your trip...</h2>
          <p className="loading-sub">Analyzing weather, traffic, and your mood context.</p>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="features-hero-bg" style={{ minHeight: '100vh' }}>
        <div className="bento-hero-overlay"></div>
        <Navbar />
        <section className="mood-hero wrap" style={{ paddingTop: '100px', paddingBottom: '40px', position: 'relative', zIndex: 2, maxWidth: '100%', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
          <div className="planner-card">

            {/* BAND 1 - TOP ROW */}
            <div className="pc-top-row">
              <div className="pc-top-left">
                <div className="pc-eyebrow">
                  <span className="dot"></span> Mood-based planner &middot; 02
                </div>
                <div className="pc-title-group">
                  <h1 className="pc-title-ta">உணர்வு</h1>
                  <h1 className="pc-title-en">MoodTrip</h1>
                </div>
                <p className="pc-subtitle">இன்று எப்படி உணர்கிறீர்கள்? &middot; How do you want to feel today?</p>
              </div>
              <div className="pc-top-right">
                <div className="stat-pill">
                  <div className="stat-item">
                    <div className="stat-val clock-display">{timeString}</div>
                    <div className="stat-lbl">CHENNAI TIME</div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <div className="stat-val">37°C</div>
                    <div className="stat-lbl">HEAT INDEX</div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <div className="stat-val">{timeContext.outdoorWindow}</div>
                    <div className="stat-lbl">OUTDOOR WINDOW</div>
                  </div>
                </div>
              </div>
            </div>

            {/* BAND 2 - THIN DIVIDER */}
            <div className="pc-divider-wrap"><div className="pc-divider"></div></div>

            {/* BAND 3 - MOOD SELECTOR */}
            <div className="pc-mood-selector">
              <div className="pc-section-label">PICK YOUR MOOD</div>
              <div className="pc-mood-grid">
                {MOODS.map(m => (
                  <button
                    key={m.id}
                    className={`pc-mood-card ${selectedMood === m.id ? 'active' : ''}`}
                    style={{ '--bg': m.bg, '--accent': m.accent }}
                    onClick={() => setSelectedMood(m.id)}
                  >
                    {selectedMood === m.id && <div className="pc-check-badge"><Check size={10} color="#fff" strokeWidth={4} /></div>}
                    <div className="pc-mood-emoji" style={{ color: m.accent, display: 'flex', justifyContent: 'center' }}>{m.icon}</div>
                    <div className="pc-mood-en">{m.name}</div>
                    <div className="pc-mood-ta">{m.ta}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* BAND 4 - BOTTOM ROW */}
            <div className="pc-bottom-row">
              <div className="pc-context-message">
                {selectedMood ? (
                  <>
                    <span style={{ color: '#B4451F', fontWeight: 'bold' }}>{MOODS.find(m => m.id === selectedMood).name}</span> &middot; <span style={{ fontStyle: 'italic', color: '#8C7E72' }}>{timeContext.timeSlot}</span> &mdash; {timeContext.message}
                  </>
                ) : (
                  <span style={{ fontStyle: 'italic', color: '#8C7E72' }}>No mood selected &mdash; pick one above.</span>
                )}
              </div>
              <button
                className={`pc-build-btn ${selectedMood ? 'active' : ''}`}
                onClick={() => {
                  if (selectedMood) {
                    document.getElementById('planner-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                Build my trip <ArrowRight size={14} style={{ marginLeft: '4px' }} />
              </button>
            </div>

          </div>
        </section>
      </div>

      <div className="moodtrip-page-content" style={{ background: '#F4F0E6' }}>

        {/* PLANNER FORM */}
        <section className="mood-form-section wrap" id="planner-form">
          <div className="mood-form-container">
            <div className="section-eyebrow">Your details</div>
            <h2 className="section-h2">Tell us more about your journey.</h2>

            <div className="form-layout">
              <div className="form-main">
                <div className="form-card">
                  <div className="form-card-head">
                    <span className="head-emoji">{selectedMood ? MOODS.find(m => m.id === selectedMood).emoji : <Sparkles size={24} />}</span>
                    <span>{selectedMood ? `${MOODS.find(m => m.id === selectedMood).name} trip — fill your details` : 'Select a mood first'}</span>
                  </div>

                  <div className="form-body">
                    <div className="form-row dates">
                      <div className="input-group">
                        <label>Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-row align-center">
                      <div className="traveller-counter">
                        <label>Travellers</label>
                        <div className="counter-pill">
                          <button onClick={() => setTravellers(Math.max(1, travellers - 1))}>&minus;</button>
                          <span>{travellers}</span>
                          <button onClick={() => setTravellers(travellers + 1)}>+</button>
                        </div>
                      </div>
                      <div className="budget-chips">
                        <label>Budget</label>
                        <div className="chips-row">
                          {BUDGETS.map(b => (
                            <button
                              key={b.id}
                              className={`chip ${budget === b.id ? 'active' : ''}`}
                              onClick={() => setBudget(b.id)}
                            >{b.label}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="transport-row">
                      <label>Preferred Transport</label>
                      <div className="chips-row wrap-chips">
                        {TRANSPORT.map(t => (
                          <button
                            key={t.id}
                            className={`chip transport-chip ${transport.includes(t.id) ? 'active' : ''}`}
                            onClick={() => toggleTransport(t.id)}
                          >
                            {t.icon} {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="notes-row">
                      <label>Additional Notes</label>
                      <textarea
                        rows="3"
                        placeholder="e.g. Avoid loud crowds, love filter coffee, no stairs..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <div className="form-footer">
                    <div className="footer-note">✦ Smart itinerary engine &middot; heat-aware &middot; Plan A + B</div>
                    <button className="btn-generate" onClick={handleGenerate}>
                      Generate my trip <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-sidebar">
                <div className="sidebar-card weather">
                  <h3 style={{display: 'flex', alignItems: 'center'}}><Thermometer size={20} style={{marginRight: '8px'}}/> Chennai heat today</h3>
                  <div className="tip-row"><Sun size={16} /> <span>Heat warning: 34°C feels like 39°C.</span></div>
                  <div className="tip-row"><Sunrise size={16} /> <span>Best outdoor hours: 6–9 AM + after 5:30 PM.</span></div>
                  <div className="tip-row"><Droplets size={16} /> <span>Hydration reminder: Carry water everywhere.</span></div>
                </div>

                <div className="sidebar-card planb">
                  <h3 style={{display: 'flex', alignItems: 'center'}}><Map size={20} style={{marginRight: '8px'}}/> What's Plan B?</h3>
                  <p>Every Sancharam trip includes backup routes for rain, heavy crowds, or unexpected closures.</p>
                  <div className="example-box">Example: Marina Beach &rarr; DakshinaChitra</div>
                </div>

                {selectedMood && (
                  <div className="sidebar-card selected-mood" style={{ '--accent': MOODS.find(m => m.id === selectedMood).color }}>
                    <div className="lg-emoji">{MOODS.find(m => m.id === selectedMood).emoji}</div>
                    <h3>{MOODS.find(m => m.id === selectedMood).ta}</h3>
                    <p>{MOODS.find(m => m.id === selectedMood).desc}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RESULTS SECTION */}
        {results && (
          <section className="mood-results wrap" id="results-section">
            <div className="results-top">
              <div className="res-title">
                <h1 className="fraunces">Your {MOODS.find(m => m.id === selectedMood)?.emoji} <i className="rust">{MOODS.find(m => m.id === selectedMood)?.name}</i> trip</h1>
                <div className="meta-chips">
                  <span>{results.days} Days</span>
                  <span>{travellers} Travellers</span>
                  <span>{BUDGETS.find(b => b.id === budget)?.label}</span>
                  <span>{transport.length} Transport types</span>
                </div>
              </div>
              <div className="res-actions">
                <button className="btn-ink"><Save size={16} /> Save trip</button>
                <button className="btn-ghost"><Printer size={16} /> Print</button>
                <button className="btn-ghost" onClick={() => setResults(null)}><X size={16} /> Clear</button>
              </div>
            </div>

            <div className="plan-toggle">
              <button className={planType === 'A' ? 'active' : ''} onClick={() => setPlanType('A')}>Plan A &mdash; Ideal</button>
              <button className={planType === 'B' ? 'active' : ''} onClick={() => setPlanType('B')}>Plan B &mdash; Backup</button>
            </div>

            {planType === 'B' && (
              <div className="plan-b-banner">
                <RefreshCw size={18} style={{marginRight: '8px'}}/> Backup plan activated &mdash; same budget, same mood, rerouted for rain, crowds, or closures.
              </div>
            )}

            <div className="days-list">
              {(planType === 'A' ? results.planA : results.planB).map((day, dIdx) => {
                const isOpen = openDays[dIdx + 1];
                return (
                  <div className={`day-card ${isOpen ? 'open' : ''}`} key={dIdx}>
                    <div className="day-header" onClick={() => toggleDay(dIdx + 1)}>
                      <div className="dh-left">
                        <span className="day-pill">Day {dIdx + 1}</span>
                        <h3 className="fraunces">{day.title}</h3>
                      </div>
                      <div className="dh-right">
                        <span className="day-cost mono">est. {day.cost}</span>
                        {isOpen ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="day-body">
                        <div className="budget-tracker">
                          <div className="bt-bar"><div className="bt-fill" style={{ width: day.budgetPct }}></div></div>
                          <div className="bt-lbl">Spend progress</div>
                        </div>

                        <div className="activities">
                          {day.activities.map((act, aIdx) => (
                            <div className="activity" key={aIdx}>
                              <div className="act-time mono rust">{act.time}</div>
                              <div className="act-details">
                                <h4 className="fraunces">{act.name}</h4>
                                <p className="muted">{act.desc}</p>
                                <div className="act-tags">
                                  <span className="tag rust-tint">{act.costTag}</span>
                                  <span className="tag green-tint">{act.transTag}</span>
                                  <span className="tag plain">{act.duration}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="recommended-stays">
              <h2 className="fraunces">Recommended stays</h2>
              <div className="hotel-grid">
                {results.hotels.map((h, i) => (
                  <div className="hotel-card" key={i}>
                    <div className="hotel-thumb"></div>
                    <div className="hotel-info">
                      <h4 className="fraunces">{h.name}</h4>
                      <p className="muted">{h.address}</p>
                      <div className="hotel-meta">
                        <span className="mono rust">{h.price}</span>
                        <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>{h.rating} <Star size={14} fill="currentColor" /></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* MY TRIPS */}
        <section className="saved-trips-section wrap">
          <div className="section-eyebrow">Saved trips</div>
          <h2 className="section-h2">Your travel history.</h2>
          <div className="trip-grid">
            <div className="trip-card">
              <div className="trip-thumb"><Camera size={24} color="#534AB7" /></div>
              <div className="trip-info">
                <h4>Heritage Walk & Coffee</h4>
                <p className="muted">12 Aug 2026</p>
                <div className="trip-tags">
                  <span className="tag">Budget</span>
                  <span className="tag">2 Travellers</span>
                  <span className="tag">ஏக்கம்</span>
                </div>
              </div>
            </div>
            <div className="trip-card">
              <div className="trip-thumb"><Utensils size={24} color="#D85A30" /></div>
              <div className="trip-info">
                <h4>Mylapore Food Trail</h4>
                <p className="muted">05 Jul 2026</p>
                <div className="trip-tags">
                  <span className="tag">Mid</span>
                  <span className="tag">4 Travellers</span>
                  <span className="tag">பசி</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

// Mock generator for UI demonstration
function generateMockData(moodId, budget, travellers) {
  const isA = true;
  return {
    days: 2,
    planA: [
      {
        title: "Morning Temples & Filter Coffee",
        cost: "₹1,200",
        budgetPct: "30%",
        activities: [
          { time: "06:30 AM", name: "Kapaleeshwarar Temple", desc: "Experience the morning pooja and serene Dravidian architecture.", costTag: "₹ Free", transTag: "Walk", duration: "1.5 hrs" },
          { time: "08:00 AM", name: "Rayar's Mess", desc: "Iconic filter coffee and fluffy idlis in a narrow Mylapore lane.", costTag: "₹ 150", transTag: "Walk", duration: "45 mins" },
        ]
      },
      {
        title: "Coastal Sunset Vibes",
        cost: "₹2,500",
        budgetPct: "70%",
        activities: [
          { time: "04:30 PM", name: "Besant Nagar Beach", desc: "Stroll along the Elliot's beach promenade as the heat drops.", costTag: "₹ Free", transTag: "Cab", duration: "2 hrs" },
          { time: "07:00 PM", name: "Murugan Idli Shop", desc: "Dinner with a variety of chutneys and podi dosas.", costTag: "₹ 600", transTag: "Auto", duration: "1 hr" },
        ]
      }
    ],
    planB: [
      {
        title: "Indoor Heritage (Rain Backup)",
        cost: "₹1,800",
        budgetPct: "40%",
        activities: [
          { time: "09:30 AM", name: "Government Museum", desc: "Explore the bronze gallery indoors away from the heat/rain.", costTag: "₹ 250", transTag: "Cab", duration: "3 hrs" },
          { time: "01:00 PM", name: "Amethyst Cafe", desc: "Relaxed lunch in a beautiful colonial-style indoor setting.", costTag: "₹ 1200", transTag: "Cab", duration: "1.5 hrs" },
        ]
      }
    ],
    hotels: [
      { name: "The Leela Palace", address: "Adyar Seaface, Chennai", price: "₹12,000/night", rating: "4.9" },
      { name: "Savera Hotel", address: "Dr Radhakrishnan Salai", price: "₹4,500/night", rating: "4.2" },
      { name: "Broad Lands", address: "Triplicane, Chennai", price: "₹1,200/night", rating: "3.8" }
    ]
  };
}

export default ItineraryPage;
