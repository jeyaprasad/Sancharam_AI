import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")(
  {
    head: () => ({
      meta: [
        { title: "Sancharam | Namma Chennai Features" },
        {
          name: "description",
          content:
            "Sancharam – smart travel planning with AI itineraries, safe routing, and hidden gems across Chennai and the world.",
        },
        { property: "og:title", content: "Sancharam | Digital Odyssey" },
        {
          property: "og:description",
          content: "AI-powered travel for the modern voyager.",
        },
        { property: "og:type", content: "website" },
      ],
      links: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;600;700&family=Yatra+One&display=swap",
        },
      ],
    }),
    component: FeaturesPage,
  }
);

function FeaturesPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;600;700&family=Yatra+One&display=swap');

        :root {
          --auto-yellow: #FFD700;
          --auto-black: #050505;
          --graphite: #111111;
          --jasmine-white: #F9F9F9;
          --bg-deep: #000000;
          --border-glow: rgba(255, 215, 0, 0.5);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          transition: color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: var(--bg-deep);
          color: var(--jasmine-white);
          overflow-x: hidden;
        }

        h1, h2, h3, h4 {
          font-family: 'Bebas Neue', cursive;
          letter-spacing: 2px;
        }

        .tamil-style {
          font-family: 'Yatra One', cursive;
          color: var(--auto-yellow);
        }

        /* NAV */
        .sf-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          padding: 20px 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(15px);
          border-bottom: 2px solid rgba(255, 215, 0, 0.15);
        }

        .sf-logo {
          font-size: 2rem;
          font-family: 'Bebas Neue';
          color: var(--jasmine-white);
          text-decoration: none;
          letter-spacing: 4px;
        }

        .sf-logo span { color: var(--auto-yellow); }

        .sf-nav a {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          margin-left: 30px;
          font-size: 1.1rem;
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
        }

        .sf-nav a:hover {
          color: var(--auto-yellow);
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
        }

        /* HERO */
        .sf-hero {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          position: relative;
          background: var(--bg-deep);
          overflow: hidden;
          padding: 0 20px;
        }

        .sf-hero::before {
          content: '';
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 60%);
          top: -200px;
          right: -200px;
          z-index: 0;
          pointer-events: none;
        }

        .sf-hero::after {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 60%);
          bottom: -150px;
          left: -150px;
          z-index: 0;
          pointer-events: none;
        }

        .sf-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
        }

        .sf-hero-tag {
          background: transparent;
          color: var(--auto-yellow);
          padding: 8px 20px;
          border-radius: 5px;
          font-weight: 700;
          letter-spacing: 3px;
          font-size: 0.9rem;
          display: inline-block;
          margin-bottom: 20px;
          border: 1px solid var(--auto-yellow);
          text-transform: uppercase;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
          font-family: 'Space Grotesk', sans-serif;
        }

        .sf-hero h1 {
          font-size: clamp(4rem, 9vw, 9rem);
          line-height: 1;
          margin-bottom: 20px;
          text-transform: uppercase;
          color: var(--jasmine-white);
        }

        .sf-hero h1 span.highlight {
          color: var(--auto-yellow);
          text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
        }

        .sf-hero p {
          font-size: 1.2rem;
          color: rgba(255,255,255,0.6);
          max-width: 650px;
          margin: 0 auto 40px;
          line-height: 1.6;
          font-family: 'Space Grotesk', sans-serif;
        }

        /* VAZHIKATTI */
        .sf-vazhikatti-section {
          padding: 100px 5vw;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .sf-section-header {
          margin-bottom: 80px;
          text-align: center;
        }

        .sf-section-header h2 {
          font-size: 4.5rem;
          color: var(--jasmine-white);
        }

        .sf-section-header p {
          font-size: 1.2rem;
          color: rgba(255,255,255,0.5);
          max-width: 600px;
          margin: 15px auto 0;
          font-family: 'Space Grotesk', sans-serif;
        }

        .sf-vazhikatti-container {
          display: flex;
          flex-direction: column;
          gap: 100px;
        }

        .sf-vazhikatti-card {
          display: flex;
          align-items: center;
          background: var(--graphite);
          border-radius: 20px;
          border: 1px solid rgba(255, 215, 0, 0.05);
          text-decoration: none;
          color: var(--jasmine-white);
          position: relative;
          width: 85%;
          padding: 60px 50px;
          transition: all 0.5s ease;
        }

        .sf-vazhikatti-card.left  { align-self: flex-start; }
        .sf-vazhikatti-card.right { align-self: flex-end; flex-direction: row-reverse; text-align: right; }

        .sf-vazhikatti-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(255, 215, 0, 0.6);
          box-shadow: 0 25px 50px rgba(255, 215, 0, 0.1);
          background: #141414;
        }

        .sf-card-number {
          font-size: 12rem;
          font-family: 'Bebas Neue';
          color: rgba(255, 215, 0, 0.03);
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          transition: all 0.5s ease;
          pointer-events: none;
        }

        .sf-vazhikatti-card.left  .sf-card-number { right: 20px; }
        .sf-vazhikatti-card.right .sf-card-number { left: 20px; }

        .sf-vazhikatti-card:hover .sf-card-number {
          color: rgba(255, 215, 0, 0.1);
          transform: translateY(-50%) scale(1.05);
        }

        .sf-card-content { position: relative; z-index: 2; }

        .sf-v-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          display: inline-block;
          filter: grayscale(1) brightness(1.5);
          transition: filter 0.4s;
        }

        .sf-vazhikatti-card:hover .sf-v-icon { filter: grayscale(0) brightness(1); }

        .sf-v-title {
          font-size: 3.5rem;
          margin-bottom: 15px;
          color: var(--jasmine-white);
          transition: color 0.4s;
          line-height: 1;
        }

        .sf-vazhikatti-card:hover .sf-v-title { color: var(--auto-yellow); }

        .sf-v-desc {
          font-size: 1.2rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
          max-width: 500px;
          transition: color 0.4s;
          font-family: 'Space Grotesk', sans-serif;
        }

        .sf-vazhikatti-card:hover .sf-v-desc { color: rgba(255,255,255,0.8); }

        @media(max-width: 900px) {
          .sf-vazhikatti-card { width: 100%; flex-direction: column !important; text-align: left !important; padding: 40px 30px; }
          .sf-vazhikatti-card.left .sf-card-number,
          .sf-vazhikatti-card.right .sf-card-number { right: 20px; left: auto; top: 20px; transform: none; font-size: 6rem; }
          .sf-vazhikatti-card:hover .sf-card-number { transform: scale(1.1); }
        }

        /* PLACES STRIP */
        .sf-places-strip {
          padding: 80px 0;
          background: var(--bg-deep);
          overflow: hidden;
          white-space: nowrap;
          display: flex;
          border-top: 1px solid rgba(255, 215, 0, 0.05);
        }

        .sf-places-track {
          display: flex;
          gap: 30px;
          animation: sf-scroll 30s linear infinite;
        }

        .sf-places-track:hover { animation-play-state: paused; }

        @keyframes sf-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .sf-place-card {
          width: 320px;
          height: 420px;
          background-size: cover;
          background-position: center;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          filter: grayscale(1);
          transition: filter 0.5s;
        }

        .sf-place-card:hover { filter: grayscale(0); }

        .sf-place-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.95), transparent);
        }

        .sf-place-info {
          position: absolute;
          bottom: 25px;
          left: 25px;
          z-index: 2;
        }

        .sf-place-info h4 {
          font-size: 2.2rem;
          color: var(--auto-yellow);
          margin-bottom: 5px;
        }

        .sf-place-info p {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.7);
          white-space: normal;
          font-family: 'Space Grotesk', sans-serif;
        }

        /* CTA */
        .sf-cta {
          padding: 150px 20px;
          text-align: center;
          background: var(--auto-yellow);
          color: var(--auto-black);
          position: relative;
          overflow: hidden;
        }

        .sf-cta h2 { font-size: 6rem; margin-bottom: 20px; line-height: 1; }

        .sf-cta p {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 50px;
          color: rgba(0,0,0,0.8);
          font-family: 'Space Grotesk', sans-serif;
        }

        .sf-cta-btn {
          background: var(--auto-black);
          color: var(--auto-yellow);
          padding: 20px 60px;
          font-size: 1.2rem;
          font-weight: 700;
          text-decoration: none;
          border-radius: 50px;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-family: 'Space Grotesk', sans-serif;
          display: inline-block;
        }

        .sf-cta-btn:hover {
          background: var(--jasmine-white);
          color: var(--auto-black);
          box-shadow: 0 15px 35px rgba(0,0,0,0.3);
          transform: translateY(-4px);
        }

        /* FOOTER */
        .sf-footer {
          background: var(--auto-black);
          padding: 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255,215,0,0.1);
        }

        .sf-footer-logo {
          font-family: 'Bebas Neue';
          font-size: 2rem;
          color: var(--jasmine-white);
        }

        .sf-footer-logo span { color: var(--auto-yellow); }

        .sf-footer-links a {
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          margin-left: 25px;
          font-size: 0.95rem;
          transition: color 0.3s;
          font-family: 'Space Grotesk', sans-serif;
        }

        .sf-footer-links a:hover { color: var(--auto-yellow); }

        @media(max-width: 600px) {
          .sf-hero h1 { font-size: 4rem; }
          .sf-cta h2  { font-size: 4rem; }
          .sf-footer  { flex-direction: column; gap: 20px; text-align: center; }
          .sf-footer-links { margin-top: 15px; }
          .sf-footer-links a { margin: 0 10px; }
          .sf-section-header h2 { font-size: 3.5rem; }
        }

        /* Animations */
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Header */}
      <header className="sf-header">
        <a href="/" className="sf-logo">SAN<span>CHARAM</span></a>
        <nav className="sf-nav">
          <a href="/">Home</a>
          <a href="/">Features</a>
          <a href="/itinerary">Itinerary</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="sf-hero">
        <div className="sf-hero-content fade-in">
          <div className="sf-hero-tag">System Interface</div>
          <h1>The Soul of <span className="highlight">Chennai</span></h1>
          <p>Experience the traditional aesthetic of Madras wrapped in a highly advanced, intelligent digital framework.</p>
        </div>
      </section>

      {/* Vazhikatti Section */}
      <section className="sf-vazhikatti-section">
        <div className="sf-section-header fade-in">
          <h2>Our <span className="tamil-style">Vazhikatti</span> (Compass)</h2>
          <p>A custom interface breaking standard grids. Designed uniquely to chart your course through the cultural heart of Madras.</p>
        </div>

        <div className="sf-vazhikatti-container">
          {/* 1. Safety */}
          <a href="/features/safety" className="sf-vazhikatti-card left fade-in">
            <div className="sf-card-number">01</div>
            <div className="sf-card-content">
              <span className="sf-v-icon">🛡️</span>
              <h3 className="sf-v-title">Safety AI</h3>
              <p className="sf-v-desc">Real-time local safety intelligence mapping out every ward of Chennai. Always know the safest routes, crowd conditions, and verified spots.</p>
            </div>
          </a>

          {/* 2. Routing */}
          <a href="/features/routing" className="sf-vazhikatti-card right fade-in">
            <div className="sf-card-number">02</div>
            <div className="sf-card-content">
              <span className="sf-v-icon">🛣️</span>
              <h3 className="sf-v-title">Smart Routing</h3>
              <p className="sf-v-desc">Bypass the Mount Road traffic. Find the efficient neural paths along the coastal corridors and unearth the city's hidden alleyways.</p>
            </div>
          </a>

          {/* 3. Itinerary */}
          <a href="/features/itinerary" className="sf-vazhikatti-card left fade-in">
            <div className="sf-card-number">03</div>
            <div className="sf-card-content">
              <span className="sf-v-icon">⏱️</span>
              <h3 className="sf-v-title">Fluid Timelines</h3>
              <p className="sf-v-desc">Your plans adapt on the fly. Schedule shifts automatically without breaking your journey logic, whether you stop for coffee or the beach.</p>
            </div>
          </a>

          {/* 4. Blockchain */}
          <a href="/features/blockchain" className="sf-vazhikatti-card right fade-in">
            <div className="sf-card-number">04</div>
            <div className="sf-card-content">
              <span className="sf-v-icon">⛓️</span>
              <h3 className="sf-v-title">Vault Identity</h3>
              <p className="sf-v-desc">Secure hotel check-ins and travel bookings executed exclusively via blockchain. True decentralised verification across the grid.</p>
            </div>
          </a>

          {/* 5. Uncharted */}
          <a href="/features/uncharted" className="sf-vazhikatti-card left fade-in">
            <div className="sf-card-number">05</div>
            <div className="sf-card-content">
              <span className="sf-v-icon">🔭</span>
              <h3 className="sf-v-title">Uncharted Madras</h3>
              <p className="sf-v-desc">Discover the late-night hidden food streets, quiet historical markers, and cultural events completely detached from mainstream maps.</p>
            </div>
          </a>
        </div>
      </section>

      {/* Places Strip */}
      <section className="sf-places-strip fade-in">
        <div className="sf-places-track">
          {[
            { img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80", name: "Kapaleeshwarar", desc: "The spirit of Mylapore" },
            { img: "https://images.unsplash.com/photo-1616843413587-9e3a37f7bbd8?w=600&q=80", name: "Marina Beach", desc: "World's second longest" },
            { img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&q=80", name: "Napier Bridge", desc: "The glowing arches" },
            { img: "https://images.unsplash.com/photo-1621213309536-e69d7491d90c?w=600&q=80", name: "Chennai Central", desc: "The iconic gateway" },
            { img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80", name: "Kapaleeshwarar", desc: "The spirit of Mylapore" },
            { img: "https://images.unsplash.com/photo-1616843413587-9e3a37f7bbd8?w=600&q=80", name: "Marina Beach", desc: "World's second longest" },
            { img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&q=80", name: "Napier Bridge", desc: "The glowing arches" },
            { img: "https://images.unsplash.com/photo-1621213309536-e69d7491d90c?w=600&q=80", name: "Chennai Central", desc: "The iconic gateway" },
          ].map((place, i) => (
            <div
              key={i}
              className="sf-place-card"
              style={{ backgroundImage: `url('${place.img}')` }}
            >
              <div className="sf-place-info">
                <h4>{place.name}</h4>
                <p>{place.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="sf-cta fade-in">
        <h2>Ready for Madras?</h2>
        <p>Your ultimate digital companion for the cultural capital.</p>
        <a href="/features/itinerary" className="sf-cta-btn">Start the Journey</a>
      </section>

      {/* Footer */}
      <footer className="sf-footer">
        <div className="sf-footer-logo">SAN<span>CHARAM</span></div>
        <div className="sf-footer-links">
          <a href="/">Home</a>
          <a href="/">Features</a>
          <a href="/itinerary">Itinerary</a>
        </div>
      </footer>
    </>
  );
}
