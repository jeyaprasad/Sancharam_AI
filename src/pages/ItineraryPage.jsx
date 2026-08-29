import React, { useState } from 'react';
import { Link } from '@/lib/router-compat';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './ItineraryPage.css';
import {
  Calendar, Clock, ChevronDown, ChevronUp, Sun, Sunrise, Droplets,
  ArrowRight, Printer, Save, X, Minus, Plus, MapPin,
  Leaf, Compass, UtensilsCrossed, Zap, Sunset, PartyPopper,
  Footprints, CarTaxiFront, Bus, TramFront, TrainFront, CarFront,
  ThermometerSun, Sparkles, CloudRain, Star, RefreshCw,
} from 'lucide-react';

const MOODS = [
  { id: 'calm', name: 'Calm', ta: 'அமைதி', Icon: Leaf, desc: 'Quiet temples, peaceful beaches, serene parks.' },
  { id: 'curious', name: 'Curious', ta: 'ஆர்வம்', Icon: Compass, desc: 'Museums, heritage walks, local history.' },
  { id: 'hungry', name: 'Hungry', ta: 'பசி', Icon: UtensilsCrossed, desc: 'Street food, iconic messes, fine dining.' },
  { id: 'adventurous', name: 'Adventurous', ta: 'சாகசம்', Icon: Zap, desc: 'Surfing, theme parks, bustling markets.' },
  { id: 'nostalgic', name: 'Nostalgic', ta: 'ஏக்கம்', Icon: Sunset, desc: 'Old Madras charm, vintage cafes, classic spots.' },
  { id: 'celebratory', name: 'Celebratory', ta: 'கொண்டாட்டம்', Icon: PartyPopper, desc: 'Shopping, high-energy spots, nightlife.' },
];

const TRANSPORT = [
  { id: 'walk', Icon: Footprints, label: 'Walk' },
  { id: 'auto', Icon: CarTaxiFront, label: 'Auto' },
  { id: 'bus', Icon: Bus, label: 'MTC bus' },
  { id: 'metro', Icon: TramFront, label: 'Metro' },
  { id: 'mrts', Icon: TrainFront, label: 'MRTS' },
  { id: 'cab', Icon: CarFront, label: 'Cab' },
];

const BUDGETS = [
  { id: 'budget', label: '₹ Budget' },
  { id: 'mid', label: '₹₹ Mid' },
  { id: 'luxury', label: '₹₹₹ Luxury' },
];

const SAVED_TRIPS = [
  { name: 'Heritage Walk & Coffee', date: '12 Aug 2026', Icon: Sunset, tags: ['Budget', '2 Travellers', 'ஏக்கம்'] },
  { name: 'Mylapore Food Trail', date: '05 Jul 2026', Icon: UtensilsCrossed, tags: ['Mid', '4 Travellers', 'பசி'] },
];

const ItineraryPage = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [travellers, setTravellers] = useState(2);
  const [budget, setBudget] = useState('mid');
  const [transport, setTransport] = useState(['metro', 'cab']);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [planType, setPlanType] = useState('A');
  const [openDays, setOpenDays] = useState({ 1: true });

  const activeMood = MOODS.find(m => m.id === selectedMood);

  const toggleTransport = (id) => {
    setTransport(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const pickMood = (id) => {
    setSelectedMood(id);
    const el = document.getElementById('planner-form');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!selectedMood) {
      alert('Please select a mood first!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setResults(generateMockData(selectedMood, budget, travellers));
      setLoading(false);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 2000);
  };

  const toggleDay = (dayId) => {
    setOpenDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="itn-page">
      {loading && (
        <div className="itn-loading">
          <div className="itn-spinner"></div>
          <h2>Building your trip…</h2>
          <p>உங்கள் பயணம் உருவாகிறது — analyzing weather, crowds & your mood.</p>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="itn-hero">
        <Navbar />
        <div className="itn-wrap itn-hero-grid">
          <div className="itn-hero-left">
            <div className="itn-eyebrow"><i></i> நேரம் · Mood-based trip planner</div>
            <h1 className="itn-title">நேரம்</h1>
            <p className="itn-subtitle">
              <strong>மனது முதலில், திட்டம் பின்னர் — feel first, plan second.</strong> Pick a
              mood (உணர்வு) and get a complete Chennai day plan built around your emotional
              context, the hour of the day (நேரம்), and your budget — எப்போதும் ஒரு backup plan
              ready.
            </p>
           </div>

          <aside className="itn-time-card">
            <div className="itn-time-head"><Clock size={15} /> Best time for each mood — right now</div>
            <div className="itn-clock">{timeString}</div>
            <p className="itn-time-note">Afternoon heat is peaking. Indoor or shaded activities highly recommended.</p>
            <div className="itn-conds">
              <div className="itn-cond"><span className="itn-dot sea"></span> Great for: Museums, Cafes, Malls</div>
              <div className="itn-cond"><span className="itn-dot terra"></span> Warn: Beaches, Walking tours</div>
            </div>
            <div className="itn-quick-moods">
              {MOODS.slice(0, 4).map(m => (
                <button key={m.id} onClick={() => pickMood(m.id)} className={selectedMood === m.id ? 'active' : ''}>
                  <m.Icon size={14} /> {m.name}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* ── STEP 1 · MOOD SELECTOR ───────────────────────────── */}
      <section className="itn-wrap itn-section" id="mood-selector">
        <div className="itn-sec-head">
          <span className="itn-step">படி 1 · Step 1</span>
          <h2>How do you want to feel today?</h2>
          <p>இன்று எப்படி உணர்கிறீர்கள்? — your mood shapes the whole day.</p>
        </div>
        <div className="itn-mood-grid">
          {MOODS.map(m => (
            <button
              key={m.id}
              className={`itn-mood-card ${selectedMood === m.id ? 'active' : ''}`}
              onClick={() => pickMood(m.id)}
            >
              <span className="itn-mood-icon"><m.Icon size={22} /></span>
              <span className="itn-mood-name">{m.name}</span>
              <span className="itn-mood-ta">{m.ta}</span>
              <span className="itn-mood-desc">{m.desc}</span>
              <span className="itn-mood-bar"></span>
            </button>
          ))}
        </div>
      </section>

      {/* ── STEP 2 · PLANNER FORM ────────────────────────────── */}
      <section className="itn-wrap itn-section" id="planner-form">
        <div className="itn-sec-head">
          <span className="itn-step">படி 2 · Step 2</span>
          <h2>Tell us more about your journey.</h2>
          <p>Dates, people, budget and how you like to move around the city.</p>
        </div>

        <div className="itn-form-layout">
          <div className="itn-form-card">
            <div className="itn-form-head">
              {activeMood ? <activeMood.Icon size={20} /> : <Sparkles size={20} />}
              <span>{activeMood ? `${activeMood.name} · ${activeMood.ta} trip — fill your details` : 'Select a mood above first'}</span>
            </div>

            <div className="itn-form-body">
              <div className="itn-row two">
                <div className="itn-field">
                  <label><Calendar size={13} /> Start date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="itn-field">
                  <label><Calendar size={13} /> End date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="itn-row two align-end">
                <div className="itn-field">
                  <label>Travellers · பயணிகள்</label>
                  <div className="itn-counter">
                    <button type="button" onClick={() => setTravellers(Math.max(1, travellers - 1))}><Minus size={14} /></button>
                    <span>{travellers}</span>
                    <button type="button" onClick={() => setTravellers(travellers + 1)}><Plus size={14} /></button>
                  </div>
                </div>
                <div className="itn-field">
                  <label>Budget · செலவு</label>
                  <div className="itn-chips">
                    {BUDGETS.map(b => (
                      <button key={b.id} type="button"
                        className={`itn-chip ${budget === b.id ? 'active' : ''}`}
                        onClick={() => setBudget(b.id)}>{b.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="itn-field">
                <label>Preferred transport · போக்குவரத்து</label>
                <div className="itn-chips wrap">
                  {TRANSPORT.map(t => (
                    <button key={t.id} type="button"
                      className={`itn-chip ${transport.includes(t.id) ? 'active' : ''}`}
                      onClick={() => toggleTransport(t.id)}>
                      <t.Icon size={14} /> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="itn-field">
                <label>Additional notes</label>
                <textarea rows="3"
                  placeholder="e.g. Avoid loud crowds, love filter coffee, no stairs…"
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="itn-form-foot">
              <span className="itn-foot-note">✦ Smart engine · heat-aware · Plan A + B</span>
              <button className="itn-btn-primary" onClick={handleGenerate}>
                Generate my trip <ArrowRight size={17} />
              </button>
            </div>
          </div>

          <div className="itn-form-side">
            <div className="itn-side-card">
              <h3><ThermometerSun size={17} /> Chennai heat today</h3>
              <div className="itn-tip"><Sun size={15} /><span>Heat warning: 34°C feels like 39°C.</span></div>
              <div className="itn-tip"><Sunrise size={15} /><span>Best outdoor hours: 6–9 AM + after 5:30 PM.</span></div>
              <div className="itn-tip"><Droplets size={15} /><span>Hydration reminder: carry water everywhere.</span></div>
            </div>

            <div className="itn-side-card sea">
              <h3><CloudRain size={17} /> What's Plan B?</h3>
              <p>Every Sancharam trip includes backup routes for rain, heavy crowds, or unexpected closures.</p>
              <div className="itn-example">Marina Beach → DakshinaChitra</div>
            </div>

            {activeMood && (
              <div className="itn-side-card mood">
                <span className="itn-side-mood-icon"><activeMood.Icon size={28} /></span>
                <h3>{activeMood.ta}</h3>
                <p>{activeMood.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── RESULTS ──────────────────────────────────────────── */}
      {results && (
        <section className="itn-wrap itn-section" id="results-section">
          <div className="itn-res-top">
            <div>
              <span className="itn-step">உங்கள் திட்டம் · Your plan</span>
              <h2 className="itn-res-title">Your <em>{activeMood?.name}</em> trip</h2>
              <div className="itn-meta-chips">
                <span>{results.days} Days</span>
                <span>{travellers} Travellers</span>
                <span>{BUDGETS.find(b => b.id === budget)?.label}</span>
                <span>{transport.length} Transport types</span>
              </div>
            </div>
            <div className="itn-res-actions">
              <button className="itn-btn-ink"><Save size={15} /> Save trip</button>
              <button className="itn-btn-ghost"><Printer size={15} /> Print</button>
              <button className="itn-btn-ghost" onClick={() => setResults(null)}><X size={15} /> Clear</button>
            </div>
          </div>

          <div className="itn-plan-toggle">
            <button className={planType === 'A' ? 'active' : ''} onClick={() => setPlanType('A')}>Plan A — Ideal</button>
            <button className={planType === 'B' ? 'active' : ''} onClick={() => setPlanType('B')}>Plan B — Backup</button>
          </div>

          {planType === 'B' && (
            <div className="itn-planb-banner">
              <RefreshCw size={15} /> Backup plan activated — same budget, same mood, rerouted for rain, crowds, or closures.
            </div>
          )}

          <div className="itn-days">
            {(planType === 'A' ? results.planA : results.planB).map((day, dIdx) => {
              const isOpen = openDays[dIdx + 1];
              return (
                <div className={`itn-day ${isOpen ? 'open' : ''}`} key={dIdx}>
                  <button className="itn-day-head" onClick={() => toggleDay(dIdx + 1)}>
                    <span className="itn-day-pill">Day {dIdx + 1}</span>
                    <h3>{day.title}</h3>
                    <span className="itn-day-cost">est. {day.cost}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div className="itn-day-body">
                      <div className="itn-track">
                        <div className="itn-track-bar"><div className="itn-track-fill" style={{ width: day.budgetPct }}></div></div>
                        <span>Spend progress · {day.budgetPct}</span>
                      </div>
                      {day.activities.map((act, aIdx) => (
                        <div className="itn-act" key={aIdx}>
                          <span className="itn-act-time">{act.time}</span>
                          <div className="itn-act-info">
                            <h4>{act.name}</h4>
                            <p>{act.desc}</p>
                            <div className="itn-act-tags">
                              <span className="terra">{act.costTag}</span>
                              <span className="sea">{act.transTag}</span>
                              <span>{act.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="itn-stays">
            <h2>Recommended stays</h2>
            <div className="itn-hotel-grid">
              {results.hotels.map((h, i) => (
                <div className="itn-hotel" key={i}>
                  <div className="itn-hotel-thumb"><MapPin size={22} /></div>
                  <h4>{h.name}</h4>
                  <p>{h.address}</p>
                  <div className="itn-hotel-meta">
                    <span className="price">{h.price}</span>
                    <span className="rating"><Star size={13} /> {h.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SAVED TRIPS ──────────────────────────────────────── */}
      <section className="itn-wrap itn-section">
        <div className="itn-sec-head">
          <span className="itn-step">சேமித்தவை · Saved trips</span>
          <h2>Your travel history.</h2>
        </div>
        <div className="itn-trip-grid">
          {SAVED_TRIPS.map((t, i) => (
            <div className="itn-trip" key={i}>
              <div className="itn-trip-thumb"><t.Icon size={24} /></div>
              <div className="itn-trip-info">
                <h4>{t.name}</h4>
                <p>{t.date}</p>
                <div className="itn-trip-tags">
                  {t.tags.map((tag, j) => <span key={j}>{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Mock generator for UI demonstration
function generateMockData(moodId, budget, travellers) {
  return {
    days: 2,
    planA: [
      {
        title: 'Morning Temples & Filter Coffee',
        cost: '₹1,200',
        budgetPct: '30%',
        activities: [
          { time: '06:30 AM', name: 'Kapaleeshwarar Temple', desc: 'Experience the morning pooja and serene Dravidian architecture.', costTag: '₹ Free', transTag: 'Walk', duration: '1.5 hrs' },
          { time: '08:00 AM', name: "Rayar's Mess", desc: 'Iconic filter coffee and fluffy idlis in a narrow Mylapore lane.', costTag: '₹ 150', transTag: 'Walk', duration: '45 mins' },
        ],
      },
      {
        title: 'Coastal Sunset Vibes',
        cost: '₹2,500',
        budgetPct: '70%',
        activities: [
          { time: '04:30 PM', name: 'Besant Nagar Beach', desc: "Stroll along the Elliot's beach promenade as the heat drops.", costTag: '₹ Free', transTag: 'Cab', duration: '2 hrs' },
          { time: '07:00 PM', name: 'Murugan Idli Shop', desc: 'Dinner with a variety of chutneys and podi dosas.', costTag: '₹ 600', transTag: 'Auto', duration: '1 hr' },
        ],
      },
    ],
    planB: [
      {
        title: 'Indoor Heritage (Rain Backup)',
        cost: '₹1,800',
        budgetPct: '40%',
        activities: [
          { time: '09:30 AM', name: 'Government Museum', desc: 'Explore the bronze gallery indoors away from the heat/rain.', costTag: '₹ 250', transTag: 'Cab', duration: '3 hrs' },
          { time: '01:00 PM', name: 'Amethyst Cafe', desc: 'Relaxed lunch in a beautiful colonial-style indoor setting.', costTag: '₹ 1200', transTag: 'Cab', duration: '1.5 hrs' },
        ],
      },
    ],
    hotels: [
      { name: 'The Leela Palace', address: 'Adyar Seaface, Chennai', price: '₹12,000/night', rating: '4.9' },
      { name: 'Savera Hotel', address: 'Dr Radhakrishnan Salai', price: '₹4,500/night', rating: '4.2' },
      { name: 'Broad Lands', address: 'Triplicane, Chennai', price: '₹1,200/night', rating: '3.8' },
    ],
  };
}

export default ItineraryPage;
