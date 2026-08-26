import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Features = () => {
  const [activeTab, setActiveTab] = useState(0);
  const elementsRef = useRef([]);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  useEffect(() => {
    document.title = 'Core Features - Sancharam';
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elementsRef.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="features-container">
      <Navbar />
      {/* 🔹 HERO BANNER 🔹 */}
      <div className="features-hero-bg">
        <div className="bento-hero-overlay"></div>
        <div className="wrap" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <section className="bento-hero rv" ref={addToRefs}>
            <span className="pill" lang="ta" style={{ margin: '0 auto 24px auto' }}><i></i>நம்ம சென்னை</span>
            <h1 className="bento-hero-title">Discover the Soul of <em>Madras</em></h1>
            <p className="bento-hero-subtitle">
              Sancharam goes beyond standard maps. Experience deep heritage, real-time safety, 
              and hyper-local secrets wrapped in a next-generation digital guide.
            </p>
            
            <div className="bento-stats" style={{ marginBottom: "80px" }}>
              <div className="bento-stat">
                <b>6</b>
                <span>Curated<br/>Zones</span>
              </div>
              <div className="bento-stat">
                <b>4</b>
                <span>Core<br/>Features</span>
              </div>
              <div className="bento-stat">
                <b>24/7</b>
                <span>Safety<br/>Focus</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 🔹 TABS & PANELS 🔹 */}
      <div className="tabs wrap">
        <button className={`tab ${activeTab === 0 ? 'on' : ''}`} role="tab" aria-selected={activeTab === 0} onClick={() => setActiveTab(0)}>
          <span className="icon">U</span>
          <span className="lbl">Unarvu</span>
        </button>
        <button className={`tab ${activeTab === 1 ? 'on' : ''}`} role="tab" aria-selected={activeTab === 1} onClick={() => setActiveTab(1)}>
          <span className="icon">N</span>
          <span className="lbl">Neram</span>
        </button>
        <button className={`tab ${activeTab === 2 ? 'on' : ''}`} role="tab" aria-selected={activeTab === 2} onClick={() => setActiveTab(2)}>
          <span className="icon">K</span>
          <span className="lbl">Kaaval</span>
        </button>
        <button className={`tab ${activeTab === 3 ? 'on' : ''}`} role="tab" aria-selected={activeTab === 3} onClick={() => setActiveTab(3)}>
          <span className="icon">O</span>
          <span className="lbl">Oor</span>
        </button>
        <button className={`tab ${activeTab === 4 ? 'on' : ''}`} role="tab" aria-selected={activeTab === 4} onClick={() => setActiveTab(4)}>
          <span className="icon">₹</span>
          <span className="lbl">Payana Nidhi</span>
        </button>
      </div>

      <section className="panels rv wrap" ref={addToRefs}>
        <div className={`panel ${activeTab === 0 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 0}>
          <div>
            <h3 lang="ta">உணர்வு</h3>
            <p className="panel-en-title">Unarvu</p>
            <span className="panel-tag">Context-Aware Heritage</span>
            <p>Stand before Kapaleeshwarar and immediately understand its Dravidian architecture without reading a textbook.</p>
            <Link to="/features/safety" className="panel-go">Explore Safety &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/index/temples.jpg" alt="Unarvu" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 1 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 1}>
          <div>
            <h3 lang="ta">நேரம்</h3>
            <p className="panel-en-title">Neram</p>
            <span className="panel-tag">Time-Aware Discovery</span>
            <p>Marina at 5 AM and 5 PM are different places. See what Chennai offers right now.</p>
            <Link to="/features/routing" className="panel-go">Explore Routing &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/features/neram.jpg" alt="Neram" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 2 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 2}>
          <div>
            <h3 lang="ta">காவல்</h3>
            <p className="panel-en-title">Kaaval</p>
            <span className="panel-tag">Solo Safety Mode</span>
            <p>Register emergency contacts, activate SOS, get night-mode warnings after 9 PM.</p>
            <Link to="/features/itinerary" className="panel-go">Plan Trip &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/features/kaaval.jpg" alt="Kaaval" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 3 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 3}>
          <div>
            <h3 lang="ta">ஊர்</h3>
            <p className="panel-en-title">Oor</p>
            <span className="panel-tag">Hyper-Local Discovery</span>
            <p>6 Chennai zones. Hidden spots TripAdvisor will never show you. See through local eyes.</p>
            <Link to="/features/uncharted" className="panel-go">Discover Secrets &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/features/oor.jpg" alt="Oor" loading="lazy" />
          </div>
        </div>

        <div className={`panel ${activeTab === 4 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 4}>
          <div>
            <h3 lang="ta">பயண நிதி</h3>
            <p className="panel-en-title">Payana Nidhi</p>
            <span className="panel-tag">Smart Budgeting</span>
            <p>Track expenses in INR, categorize automatically, and unlock gamified budget achievements.</p>
            <Link to="/features/budget" className="panel-go">Track Budget &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/index/aerial-view.jpg" alt="Payana Nidhi" loading="lazy" />
          </div>
        </div>
      </section>

      <div className="wrap">
        {/* 🔹 MARQUEE 🔹 */}
        <div className="marquee rv" ref={addToRefs}>
          <div className="track">
            <figure className="place"><img src="/assets/images/features/parthasarathy.jpg" alt="Parthasarathy Temple" loading="lazy" /><figcaption className="place-info"><h4>Parthasarathy</h4><p>The soul of Triplicane</p></figcaption></figure>
            <figure className="place"><img src="/assets/images/features/napier_bridge.jpg" alt="Napier Bridge" loading="lazy" /><figcaption className="place-info"><h4>Napier Bridge</h4><p>Iconic island connector</p></figcaption></figure>
            <figure className="place"><img src="/assets/images/features/santhome.jpg" alt="San Thome Basilica" loading="lazy" /><figcaption className="place-info"><h4>San Thome</h4><p>White on the shoreline</p></figcaption></figure>
            <figure className="place"><img src="/assets/images/features/royapuram.jpg" alt="Royapuram Harbour" loading="lazy" /><figcaption className="place-info"><h4>Royapuram</h4><p>Fishing harbour dawn</p></figcaption></figure>
            <figure className="place"><img src="/assets/images/features/valluvarkottam.jpg" alt="Valluvar Kottam" loading="lazy" /><figcaption className="place-info"><h4>Valluvar Kottam</h4><p>Chariot of verses</p></figcaption></figure>
            <figure className="place"><img src="/assets/images/index/tranquebar_fort.jpg" alt="Tranquebar Fort" loading="lazy" /><figcaption className="place-info"><h4>Tranquebar Fort</h4><p>Danish coastal legacy</p></figcaption></figure>
            {/* Duplicated for seamless marquee */}
            <figure className="place"><img src="/assets/images/features/parthasarathy.jpg" alt="Parthasarathy Temple" loading="lazy" /><figcaption className="place-info"><h4>Parthasarathy</h4><p>The soul of Triplicane</p></figcaption></figure>
            <figure className="place"><img src="/assets/images/features/napier_bridge.jpg" alt="Napier Bridge" loading="lazy" /><figcaption className="place-info"><h4>Napier Bridge</h4><p>Iconic island connector</p></figcaption></figure>
            <figure className="place"><img src="/assets/images/features/santhome.jpg" alt="San Thome Basilica" loading="lazy" /><figcaption className="place-info"><h4>San Thome</h4><p>White on the shoreline</p></figcaption></figure>
            <figure className="place"><img src="/assets/images/features/royapuram.jpg" alt="Royapuram Harbour" loading="lazy" /><figcaption className="place-info"><h4>Royapuram</h4><p>Fishing harbour dawn</p></figcaption></figure>
            <figure className="place"><img src="/assets/images/features/valluvarkottam.jpg" alt="Valluvar Kottam" loading="lazy" /><figcaption className="place-info"><h4>Valluvar Kottam</h4><p>Chariot of verses</p></figcaption></figure>
            <figure className="place"><img src="/assets/images/index/tranquebar_fort.jpg" alt="Tranquebar Fort" loading="lazy" /><figcaption className="place-info"><h4>Tranquebar Fort</h4><p>Danish coastal legacy</p></figcaption></figure>
          </div>
        </div>

        {/* 🔹 CTA 🔹 */}
        <section className="cta rv" ref={addToRefs}>
          <div>
            <h2>Ready for <em>Madras</em>?</h2>
            <p>Start with a plan, or just wander I"AA  the city rewards both.</p>
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
          <small>"O? 2026 Sancharam " - Chennai</small>
        </footer>
      </div>
    </div>
  );
};
export default Features;
