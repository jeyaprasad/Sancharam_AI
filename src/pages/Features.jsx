import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Features = () => {
  const [activeTab, setActiveTab] = useState(0);
  const elementsRef = useRef([]);
  const trackRef = useRef(null);

  useEffect(() => {
    // Reveal on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px' }
    );

    elementsRef.current.forEach((el, index) => {
      if (el) {
        el.style.transitionDelay = `${(index % 5) * 70}ms`;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const newIndex = (activeTab + (e.key === 'ArrowRight' ? 1 : -1) + 5) % 5;
    setActiveTab(newIndex);
  };

  return (
    <div className="features-container">
      <div className="features-hero-bg">
        <header>
          <div className="nav-in">
            <Link to="/" className="logo-img-link">
              <img src="/assets/images/icon.png" alt="Sancharam Logo" className="nav-logo-img" />
            </Link>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/features" aria-current="page">Features</Link>
              <Link to="/features/itinerary">Planner</Link>
              <Link to="/features/budget">Budget</Link>
            </nav>
          </div>
        </header>

        <section className="hero wrap">
          <div className="rv" ref={addToRefs}>
            <span className="pill" lang="ta"><i></i>நம்ம சென்னை</span>
            <h1>Built for the city that <em>never sits still</em></h1>
            <p className="hero-sub">Five interlocking systems that read Chennai in real time — safety data, traffic patterns, adaptive schedules, and the streets no map bothers to name.</p>
          </div>
          <div className="hero-side rv" ref={addToRefs}>
            <div className="stat"><b>21</b><span>Risk zones mapped</span></div>
            <div className="stat"><b>40+</b><span>Uncharted spots</span></div>
            <div className="stat"><b>5</b><span>Core systems</span></div>
            
            <div className="hero-side-status" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: '#D9653B', borderRadius: '50%', boxShadow: '0 0 8px rgba(217,101,59,0.8)' }}></div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFFFFF' }}>Live Data Feed</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.4 }}>
                Synchronizing reports from Chennai traffic & police datasets.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="sec wrap">
        <div className="sec-head rv" ref={addToRefs}>
          <span className="kicker" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
            Vazhikatti · <span lang="ta">வழிகாட்டி</span>
          </span>
          <h2>One compass, <em>five directions</em></h2>
          <p>Each module works standalone, but they share one map, one dataset and one sense of the city. Pick a direction.</p>
        </div>

        <div className="tabs rv" role="tablist" aria-label="Features" ref={addToRefs}>
          <button className="tab" role="tab" aria-selected={activeTab === 0} onClick={() => setActiveTab(0)} onKeyDown={handleKeyDown}>
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span className="lbl">Kaavalar Paathaikal</span><span className="tab-n">01</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 1} onClick={() => setActiveTab(1)} onKeyDown={handleKeyDown}>
            <svg viewBox="0 0 24 24"><path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6 3-6-3Z"/><path d="M9 7v13M15 4v13"/></svg>
            <span className="lbl">Dharma Diary</span><span className="tab-n">02</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 2} onClick={() => setActiveTab(2)} onKeyDown={handleKeyDown}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            <span className="lbl">Vaasal Concierge</span><span className="tab-n">03</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 3} onClick={() => setActiveTab(3)} onKeyDown={handleKeyDown}>
            <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
            <span className="lbl">Kaaval Companion</span><span className="tab-n">04</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 4} onClick={() => setActiveTab(4)} onKeyDown={handleKeyDown}>
            <svg viewBox="0 0 24 24"><path d="M2 12h4m12 0h4M12 2v4m0 12v4"/><circle cx="12" cy="12" r="5"/></svg>
            <span className="lbl">Namma Nanbargal</span><span className="tab-n">05</span>
          </button>
        </div>

        <div className={`panel ${activeTab === 0 ? 'on' : ''} rv`} role="tabpanel" hidden={activeTab !== 0} ref={addToRefs}>
          <div>
            <h3 style={{marginBottom: '4px'}}>Kaavalar Paathaikal</h3>
            <span style={{display: 'inline-block', fontSize: '0.85em', color: 'var(--rust)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Sentinel Trails</span>
            <p>Venture off the beaten path with confidence. Sentinel Trails curates scenic routes through lesser-known neighborhoods, enhanced with real-time safety insights from local authorities and traveler feedback. Discover hidden gems while prioritizing your well-being.</p>
            <Link to="/features/safety" className="go">Explore trails <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/ai/sentinel.jpg" alt="Kaavalar Paathaikal" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 1 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 1}>
          <div>
            <h3 style={{marginBottom: '4px'}}>Dharma Diary</h3>
            <span style={{display: 'inline-block', fontSize: '0.85em', color: 'var(--rust)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Sacred Journeys</span>
            <p>Immerse yourself in the spiritual essence of Tamil Nadu. Sacred Journeys crafts personalized temple trails based on your religious interests, connecting you with sacred spaces, ancient rituals, and enlightening experiences. Document your journey with built-in travel journaling.</p>
            <Link to="/features/routing" className="go">Start a journey <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/ai/dharma.jpg" alt="Dharma Diary" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 2 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 2}>
          <div>
            <h3 style={{marginBottom: '4px'}}>Vaasal Concierge</h3>
            <span style={{display: 'inline-block', fontSize: '0.85em', color: 'var(--rust)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Heritage Guide & Planner</span>
            <p>Heritage Concierge is your virtual guide to authentic Tamil experiences. From booking traditional homestays to arranging cultural workshops with local artisans, Heritage Concierge ensures a deeper connection with the region's heritage.</p>
            <Link to="/features/itinerary" className="go">Meet your guide <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/ai/vaasal.jpg" alt="Vaasal Concierge" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 3 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 3}>
          <div>
            <h3 style={{marginBottom: '4px'}}>Kaaval Companion</h3>
            <span style={{display: 'inline-block', fontSize: '0.85em', color: 'var(--rust)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Guardian Shield & Police Protection</span>
            <p>Stay protected round the clock with Guardian Shield, your personal safety companion. Leveraging advanced risk assessment and live location tracking, it provides discreet alerts when entering higher-risk areas and offers swift emergency assistance.</p>
            <Link to="/features/blockchain" className="go">Enable shield <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/ai/kaaval.jpg" alt="Kaaval Companion" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 4 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 4}>
          <div>
            <h3 style={{marginBottom: '4px'}}>Namma Nanbargal</h3>
            <span style={{display: 'inline-block', fontSize: '0.85em', color: 'var(--rust)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Travel Tribes & Groups</span>
            <p>Connect with like-minded travelers and unlock community-sourced wisdom. Join interest-based travel circles, exchange insider tips, and coordinate group activities. Collaborate on itineraries and build lasting friendships with fellow explorers.</p>
            <Link to="/features/uncharted" className="go">Join a tribe <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/ai/tribes.jpg" alt="Namma Nanbargal" loading="lazy" />
          </div>
        </div>
      </section>

      <div className="marquee rv" ref={addToRefs}>
        <div className="track" ref={trackRef}>
          <figure className="place"><img src="/assets/images/ai/dharma.jpg" alt="Kapaleeshwarar Temple" loading="lazy" /><figcaption className="place-info"><h4>Kapaleeshwarar</h4><p>The spirit of Mylapore</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/ai/tribes.jpg" alt="Elliot's Beach" loading="lazy" /><figcaption className="place-info"><h4>Elliot's Beach</h4><p>Besant Nagar evenings</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/ai/marquee_highcourt.jpg" alt="Madras High Court" loading="lazy" /><figcaption className="place-info"><h4>High Court</h4><p>Indo-Saracenic red</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/ai/marquee_santhome.jpg" alt="San Thome Basilica" loading="lazy" /><figcaption className="place-info"><h4>San Thome</h4><p>White on the shoreline</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/ai/marquee_royapuram.jpg" alt="Royapuram Harbour" loading="lazy" /><figcaption className="place-info"><h4>Royapuram</h4><p>Fishing harbour dawn</p></figcaption></figure>
          {/* Duplicated for seamless marquee */}
          <figure className="place"><img src="/assets/images/ai/dharma.jpg" alt="Kapaleeshwarar Temple" loading="lazy" /><figcaption className="place-info"><h4>Kapaleeshwarar</h4><p>The spirit of Mylapore</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/ai/tribes.jpg" alt="Elliot's Beach" loading="lazy" /><figcaption className="place-info"><h4>Elliot's Beach</h4><p>Besant Nagar evenings</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/ai/marquee_highcourt.jpg" alt="Madras High Court" loading="lazy" /><figcaption className="place-info"><h4>High Court</h4><p>Indo-Saracenic red</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/ai/marquee_santhome.jpg" alt="San Thome Basilica" loading="lazy" /><figcaption className="place-info"><h4>San Thome</h4><p>White on the shoreline</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/ai/marquee_royapuram.jpg" alt="Royapuram Harbour" loading="lazy" /><figcaption className="place-info"><h4>Royapuram</h4><p>Fishing harbour dawn</p></figcaption></figure>
        </div>
      </div>

      <div className="wrap">
        <section className="cta rv" ref={addToRefs}>
          <div>
            <h2>Ready for <em>Madras</em>?</h2>
            <p>Start with a plan, or just wander ΓÇö the city rewards both.</p>
          </div>
          <Link to="/features/itinerary" className="cta-btn">Start the journey
            <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
          </Link>
        </section>

        <footer>
          <Link to="/" className="logo">San<span>charam</span></Link>
          <div className="f-links">
            <Link to="/features/safety">Safety</Link>
            <Link to="/features/routing">Routing</Link>
            <Link to="/features/itinerary">Planner</Link>
            <Link to="/features/uncharted">Uncharted</Link>
          </div>
          <small>┬⌐ 2026 Sancharam ┬╖ Chennai</small>
        </footer>
      </div>
    </div>
  );
};

export default Features;
