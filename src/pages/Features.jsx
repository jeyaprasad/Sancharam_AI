import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Features = () => {
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
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elementsRef.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="features-container">
      {/* 🔹 HERO BANNER 🔹 */}
      <div className="features-hero-bg">
        <div className="bento-hero-overlay"></div>
        <div className="wrap" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <section className="bento-hero rv" ref={addToRefs}>
            <span className="pill" lang="ta" style={{ margin: '0 auto 24px auto' }}><i></i>r r_rr_?r_r_r_?r_?rc_?</span>
            <h1 className="bento-hero-title">Discover the Soul of <em>Madras</em></h1>
            <p className="bento-hero-subtitle">
              Sancharam goes beyond standard maps. Experience deep heritage, real-time safety, 
              and hyper-local secrets wrapped in a next-generation digital guide.
            </p>
            
            <div className="bento-stats">
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

      <div className="wrap">
        {/* 🔹 BENTO GRID 🔹 */}
        <section className="bento-grid rv" ref={addToRefs}>
          
          <Link to="/features/safety" className="bento-card bento-large">
            <div className="bento-card-bg">
              <img src="/assets/images/index/temples.jpg" alt="Unarvu" loading="lazy" />
              <div className="bento-card-gradient"></div>
            </div>
            <div className="bento-card-content">
              <span className="bento-tag">Context-Aware Heritage</span>
              <h3 lang="ta">r r _?r</h3>
              <p className="bento-title-en">Unarvu</p>
              <p className="bento-desc">Stand before Kapaleeshwarar and immediately understand its Dravidian architecture without reading a textbook.</p>
              <span className="bento-action">Explore Safety &rarr;</span>
            </div>
          </Link>

          <Link to="/features/routing" className="bento-card">
            <div className="bento-card-bg">
              <img src="/assets/images/features/neram.jpg" alt="Neram" loading="lazy" />
              <div className="bento-card-gradient"></div>
            </div>
            <div className="bento-card-content">
              <span className="bento-tag">Time-Aware Discovery</span>
              <h3 lang="ta">r"_؅rrr_?</h3>
              <p className="bento-title-en">Neram</p>
              <p className="bento-desc">Marina at 5 AM and 5 PM are different places. See what Chennai offers right now.</p>
              <span className="bento-action">Explore Routing &rarr;</span>
            </div>
          </Link>

          <Link to="/features/itinerary" className="bento-card">
            <div className="bento-card-bg">
              <img src="/assets/images/features/kaaval.jpg" alt="Kaaval" loading="lazy" />
              <div className="bento-card-gradient"></div>
            </div>
            <div className="bento-card-content">
              <span className="bento-tag">Solo Safety Mode</span>
              <h3 lang="ta">r r_rr_?</h3>
              <p className="bento-title-en">Kaaval</p>
              <p className="bento-desc">Register emergency contacts, activate SOS, and get night-mode warnings.</p>
              <span className="bento-action">Plan Trip &rarr;</span>
            </div>
          </Link>

          <Link to="/features/uncharted" className="bento-card bento-wide">
            <div className="bento-card-bg">
              <img src="/assets/images/features/oor.jpg" alt="Oor" loading="lazy" />
              <div className="bento-card-gradient"></div>
            </div>
            <div className="bento-card-content">
              <div className="bento-card-content-split">
                <div>
                  <span className="bento-tag">Hyper-Local Discovery</span>
                  <h3 lang="ta">rSr_?</h3>
                  <p className="bento-title-en">Oor</p>
                </div>
                <div>
                  <p className="bento-desc">6 Chennai zones. Hidden spots TripAdvisor will never show you. See through local eyes and uncover the city's best kept secrets.</p>
                  <span className="bento-action">Discover Secrets &rarr;</span>
                </div>
              </div>
            </div>
          </Link>
          
        </section>

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
