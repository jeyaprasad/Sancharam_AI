import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

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
        <Navbar />

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
            <span className="lbl" style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '16px'}}>Kavasam</span><span className="tab-n">01</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 1} onClick={() => setActiveTab(1)} onKeyDown={handleKeyDown}>
            <span className="lbl" style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '16px'}}>Unarvu</span><span className="tab-n">02</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 2} onClick={() => setActiveTab(2)} onKeyDown={handleKeyDown}>
            <span className="lbl" style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '16px'}}>Neram</span><span className="tab-n">03</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 3} onClick={() => setActiveTab(3)} onKeyDown={handleKeyDown}>
            <span className="lbl" style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '16px'}}>Kaaval</span><span className="tab-n">04</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 4} onClick={() => setActiveTab(4)} onKeyDown={handleKeyDown}>
            <span className="lbl" style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '16px'}}>Oor</span><span className="tab-n">05</span>
          </button>
        </div>

        <div className={`panel ${activeTab === 0 ? 'on' : ''} rv`} role="tabpanel" hidden={activeTab !== 0} ref={addToRefs}>
          <div>
            <h3 lang="ta" style={{fontFamily: "'Tiro Tamil', serif", fontSize: '42px', fontWeight: 'bold', color: '#2c2c2c', marginBottom: '4px', lineHeight: 1.2}}>கவசம்</h3>
            <p style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '18px', fontStyle: 'italic', color: '#8B6914', marginBottom: '16px', marginTop: 0}}>Kavasam</p>
            <span style={{display: 'inline-block', fontSize: '11px', color: '#C0392B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Safe Route Intelligence</span>
            <p style={{marginBottom: '32px'}}>Routes scored against Chennai crime and accident data. Know the risk before you walk the road.</p>
            <Link to="/features/safety" className="go" style={{backgroundColor: '#000', color: '#fff', padding: '12px 28px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '15px'}}>Check my route &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/features/kaavasam.jpg" alt="Kavasam" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 1 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 1}>
          <div>
            <h3 lang="ta" style={{fontFamily: "'Tiro Tamil', serif", fontSize: '42px', fontWeight: 'bold', color: '#2c2c2c', marginBottom: '4px', lineHeight: 1.2}}>உணர்வு</h3>
            <p style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '18px', fontStyle: 'italic', color: '#8B6914', marginBottom: '16px', marginTop: 0}}>Unarvu</p>
            <span style={{display: 'inline-block', fontSize: '11px', color: '#C0392B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Mood Trip Planner</span>
            <p style={{marginBottom: '32px'}}>Pick Calm, Curious, Hungry or Adventurous — get a full Chennai day plan built around your feeling.</p>
            <Link to="/features/routing" className="go" style={{backgroundColor: '#000', color: '#fff', padding: '12px 28px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '15px'}}>Pick my mood &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/features/unarvu.jpg" alt="Unarvu" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 2 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 2}>
          <div>
            <h3 lang="ta" style={{fontFamily: "'Tiro Tamil', serif", fontSize: '42px', fontWeight: 'bold', color: '#2c2c2c', marginBottom: '4px', lineHeight: 1.2}}>நேரம்</h3>
            <p style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '18px', fontStyle: 'italic', color: '#8B6914', marginBottom: '16px', marginTop: 0}}>Neram</p>
            <span style={{display: 'inline-block', fontSize: '11px', color: '#C0392B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Time-Aware Discovery</span>
            <p style={{marginBottom: '32px'}}>Marina at 5 AM and 5 PM are different places. See what Chennai offers right now.</p>
            <Link to="/features/itinerary" className="go" style={{backgroundColor: '#000', color: '#fff', padding: '12px 28px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '15px'}}>Show me now &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/features/neram.jpg" alt="Neram" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 3 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 3}>
          <div>
            <h3 lang="ta" style={{fontFamily: "'Tiro Tamil', serif", fontSize: '42px', fontWeight: 'bold', color: '#2c2c2c', marginBottom: '4px', lineHeight: 1.2}}>காவல்</h3>
            <p style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '18px', fontStyle: 'italic', color: '#8B6914', marginBottom: '16px', marginTop: 0}}>Kaaval</p>
            <span style={{display: 'inline-block', fontSize: '11px', color: '#C0392B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Solo Safety Mode</span>
            <p style={{marginBottom: '32px'}}>Register emergency contacts, activate SOS, get night-mode warnings after 9 PM.</p>
            <Link to="/features/blockchain" className="go" style={{backgroundColor: '#000', color: '#fff', padding: '12px 28px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '15px'}}>Enable Kaaval &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/features/kaaval.jpg" alt="Kaaval" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 4 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 4}>
          <div>
            <h3 lang="ta" style={{fontFamily: "'Tiro Tamil', serif", fontSize: '42px', fontWeight: 'bold', color: '#2c2c2c', marginBottom: '4px', lineHeight: 1.2}}>ஊர்</h3>
            <p style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '18px', fontStyle: 'italic', color: '#8B6914', marginBottom: '16px', marginTop: 0}}>Oor</p>
            <span style={{display: 'inline-block', fontSize: '11px', color: '#C0392B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Hyper-Local Discovery</span>
            <p style={{marginBottom: '32px'}}>6 Chennai zones. Hidden spots TripAdvisor will never show you. See through local eyes.</p>
            <Link to="/features/uncharted" className="go" style={{backgroundColor: '#000', color: '#fff', padding: '12px 28px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '15px'}}>Explore Oor &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/features/oor.jpg" alt="Oor" loading="lazy" />
          </div>
        </div>
      </section>

      <div className="marquee rv" ref={addToRefs}>
        <div className="track" ref={trackRef}>
          <figure className="place"><img src="/assets/images/features/parthasarathy.jpg" alt="Parthasarathy Temple" loading="lazy" /><figcaption className="place-info"><h4>Parthasarathy</h4><p>The soul of Triplicane</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/features/napier_bridge.jpg" alt="Napier Bridge" loading="lazy" /><figcaption className="place-info"><h4>Napier Bridge</h4><p>Iconic island connector</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/features/santhome.jpg" alt="San Thome Basilica" loading="lazy" /><figcaption className="place-info"><h4>San Thome</h4><p>White on the shoreline</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/features/royapuram.jpg" alt="Royapuram Harbour" loading="lazy" /><figcaption className="place-info"><h4>Royapuram</h4><p>Fishing harbour dawn</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/features/valluvarkottam.jpg" alt="Valluvar Kottam" loading="lazy" /><figcaption className="place-info"><h4>Valluvar Kottam</h4><p>Chariot of verses</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/features/tranquebar_fort.jpg" alt="Tranquebar Fort" loading="lazy" /><figcaption className="place-info"><h4>Tranquebar Fort</h4><p>Danish coastal legacy</p></figcaption></figure>
          {/* Duplicated for seamless marquee */}
          <figure className="place"><img src="/assets/images/features/parthasarathy.jpg" alt="Parthasarathy Temple" loading="lazy" /><figcaption className="place-info"><h4>Parthasarathy</h4><p>The soul of Triplicane</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/features/napier_bridge.jpg" alt="Napier Bridge" loading="lazy" /><figcaption className="place-info"><h4>Napier Bridge</h4><p>Iconic island connector</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/features/santhome.jpg" alt="San Thome Basilica" loading="lazy" /><figcaption className="place-info"><h4>San Thome</h4><p>White on the shoreline</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/features/royapuram.jpg" alt="Royapuram Harbour" loading="lazy" /><figcaption className="place-info"><h4>Royapuram</h4><p>Fishing harbour dawn</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/features/valluvarkottam.jpg" alt="Valluvar Kottam" loading="lazy" /><figcaption className="place-info"><h4>Valluvar Kottam</h4><p>Chariot of verses</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/features/tranquebar_fort.jpg" alt="Tranquebar Fort" loading="lazy" /><figcaption className="place-info"><h4>Tranquebar Fort</h4><p>Danish coastal legacy</p></figcaption></figure>
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
