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
            <Link to="/" className="logo">San<span>charam</span></Link>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/features" aria-current="page">Features</Link>
              <Link to="/features/itinerary">Planner</Link>
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
          </div>
        </section>
      </div>

      <section className="sec wrap">
        <div className="sec-head rv" ref={addToRefs}>
          <span className="kicker">Vazhikatti · <span lang="ta">வழிகாட்டி</span></span>
          <h2>One compass, <em>five directions</em></h2>
          <p>Each module works standalone, but they share one map, one dataset and one sense of the city. Pick a direction.</p>
        </div>

        <div className="tabs rv" role="tablist" aria-label="Features" ref={addToRefs}>
          <button className="tab" role="tab" aria-selected={activeTab === 0} onClick={() => setActiveTab(0)} onKeyDown={handleKeyDown}>
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span className="lbl">Safety</span><span className="tab-n">01</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 1} onClick={() => setActiveTab(1)} onKeyDown={handleKeyDown}>
            <svg viewBox="0 0 24 24"><path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6 3-6-3Z"/><path d="M9 7v13M15 4v13"/></svg>
            <span className="lbl">Routing</span><span className="tab-n">02</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 2} onClick={() => setActiveTab(2)} onKeyDown={handleKeyDown}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            <span className="lbl">Timelines</span><span className="tab-n">03</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 3} onClick={() => setActiveTab(3)} onKeyDown={handleKeyDown}>
            <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
            <span className="lbl">Identity</span><span className="tab-n">04</span>
          </button>
          <button className="tab" role="tab" aria-selected={activeTab === 4} onClick={() => setActiveTab(4)} onKeyDown={handleKeyDown}>
            <svg viewBox="0 0 24 24"><path d="M2 12h4m12 0h4M12 2v4m0 12v4"/><circle cx="12" cy="12" r="5"/></svg>
            <span className="lbl">Uncharted</span><span className="tab-n">05</span>
          </button>
        </div>

        <div className={`panel ${activeTab === 0 ? 'on' : ''} rv`} role="tabpanel" hidden={activeTab !== 0} ref={addToRefs}>
          <div>
            <h3>Safety Intelligence</h3>
            <p>Ward-level risk scoring built from Chennai Police crime zone data, NCRB district summaries and TNSTA accident blackspots. Know which junction turns hostile after 9 PM before you're standing in it.</p>
            <div className="chips"><span className="chip">Crime zones</span><span className="chip">NCRB 2023</span><span className="chip">Blackspots</span></div>
            <Link to="/features/safety" className="go">Explore safety <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></Link>
          </div>
          <div className="panel-art"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.5"/></svg></div>
        </div>

        <div className={`panel ${activeTab === 1 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 1}>
          <div>
            <h3>Smart Routing</h3>
            <p>Geocoded route analysis that cross-references your path against high-risk junctions and accident-prone corridors — not just the fastest line on the map. Kathipara at rush hour is a different road than Kathipara at noon.</p>
            <div className="chips"><span className="chip">Geocoding</span><span className="chip">Risk overlay</span><span className="chip">21 junctions</span></div>
            <Link to="/features/routing" className="go">Plan a route <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></Link>
          </div>
          <div className="panel-art"><svg viewBox="0 0 24 24"><path d="M4 20c4-2 3-8 8-9s6-6 8-8"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="3" r="2"/></svg></div>
        </div>

        <div className={`panel ${activeTab === 2 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 2}>
          <div>
            <h3>Fluid Timelines</h3>
            <p>Day plans that reflow when you linger over filter coffee. Shift one stop and the rest re-sequences around traffic, opening hours and daylight — no rebuilding the whole afternoon from scratch.</p>
            <div className="chips"><span className="chip">Auto-reflow</span><span className="chip">Opening hours</span><span className="chip">Save & sync</span></div>
            <Link to="/features/itinerary" className="go">Build an itinerary <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></Link>
          </div>
          <div className="panel-art"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="M12 5.5V12l4.5 3"/></svg></div>
        </div>

        <div className={`panel ${activeTab === 3 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 3}>
          <div>
            <h3>Vault Identity</h3>
            <p>Check-ins and bookings verified against a decentralised identity record. Your documents stay yours; the hotel only gets the proof it actually needs, and nothing more.</p>
            <div className="chips"><span className="chip">Self-custody</span><span className="chip">Zero-knowledge</span><span className="chip">Check-in</span></div>
            <Link to="/features/blockchain" className="go">See how it works <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></Link>
          </div>
          <div className="panel-art"><svg viewBox="0 0 24 24"><rect x="3.5" y="9.5" width="17" height="12" rx="2.5"/><path d="M7.5 9.5V6.5a4.5 4.5 0 0 1 9 0v3"/></svg></div>
        </div>

        <div className={`panel ${activeTab === 4 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 4}>
          <div>
            <h3>Uncharted Madras</h3>
            <p>Kasimedu at dawn, Linghi Chetty Street's ledgers, Broken Bridge at dusk. Forty-odd places the algorithms overlook, each with a pin you can actually open.</p>
            <div className="chips"><span className="chip">40+ places</span><span className="chip">Map pins</span><span className="chip">Local notes</span></div>
            <Link to="/features/uncharted" className="go">Go off-map <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></Link>
          </div>
          <div className="panel-art"><svg viewBox="0 0 24 24"><path d="M2 12h4.5m11 0H22M12 2v4.5m0 11V22"/><circle cx="12" cy="12" r="5.5"/></svg></div>
        </div>
      </section>

      <div className="marquee rv" ref={addToRefs}>
        <div className="track" ref={trackRef}>
          <figure className="place"><img src="/assets/images/real/kapaleeshwarar.jpg" alt="Kapaleeshwarar Temple" loading="lazy" /><figcaption className="place-info"><h4>Kapaleeshwarar</h4><p>The spirit of Mylapore</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/real/elliots.jpg" alt="Elliot's Beach" loading="lazy" /><figcaption className="place-info"><h4>Elliot's Beach</h4><p>Besant Nagar evenings</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/real/highcourt.jpg" alt="Madras High Court" loading="lazy" /><figcaption className="place-info"><h4>High Court</h4><p>Indo-Saracenic red</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/real/santhome.jpg" alt="San Thome Basilica" loading="lazy" /><figcaption className="place-info"><h4>San Thome</h4><p>White on the shoreline</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/real/brokenbridge.jpg" alt="Broken Bridge" loading="lazy" /><figcaption className="place-info"><h4>Broken Bridge</h4><p>Where the Adyar ends</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/real/royapuram.jpg" alt="Royapuram Harbour" loading="lazy" /><figcaption className="place-info"><h4>Royapuram</h4><p>Fishing harbour dawn</p></figcaption></figure>
          {/* Duplicated for seamless marquee */}
          <figure className="place"><img src="/assets/images/real/kapaleeshwarar.jpg" alt="Kapaleeshwarar Temple" loading="lazy" /><figcaption className="place-info"><h4>Kapaleeshwarar</h4><p>The spirit of Mylapore</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/real/elliots.jpg" alt="Elliot's Beach" loading="lazy" /><figcaption className="place-info"><h4>Elliot's Beach</h4><p>Besant Nagar evenings</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/real/highcourt.jpg" alt="Madras High Court" loading="lazy" /><figcaption className="place-info"><h4>High Court</h4><p>Indo-Saracenic red</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/real/santhome.jpg" alt="San Thome Basilica" loading="lazy" /><figcaption className="place-info"><h4>San Thome</h4><p>White on the shoreline</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/real/brokenbridge.jpg" alt="Broken Bridge" loading="lazy" /><figcaption className="place-info"><h4>Broken Bridge</h4><p>Where the Adyar ends</p></figcaption></figure>
          <figure className="place"><img src="/assets/images/real/royapuram.jpg" alt="Royapuram Harbour" loading="lazy" /><figcaption className="place-info"><h4>Royapuram</h4><p>Fishing harbour dawn</p></figcaption></figure>
        </div>
      </div>

      <div className="wrap">
        <section className="cta rv" ref={addToRefs}>
          <div>
            <h2>Ready for <em>Madras</em>?</h2>
            <p>Start with a plan, or just wander — the city rewards both.</p>
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
          <small>© 2026 Sancharam · Chennai</small>
        </footer>
      </div>
    </div>
  );
};

export default Features;
