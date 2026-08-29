import React from 'react';
import { Shield, Compass, Users, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import chennaiHero from '@/assets/chennai-hero.jpg.asset.json';
import './about.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <Navbar />

      {/* Hero */}
      <section
        className="about-hero"
        style={{ backgroundImage: `url(${chennaiHero.url})` }}
      >
        <div className="about-hero-overlay" aria-hidden="true" />
        <div className="about-hero-inner">
          <p className="about-eyebrow">சஞ்சாரம் · Our Story</p>
          <h1>
            Built for the city that
            <br />
            <em>never sits still.</em>
          </h1>
          <p className="about-lede">
            Sancharam AI weaves live safety data, real-time routing, and hyper-local insight
            into a single travel ecosystem — made in Chennai, for Chennai.
          </p>
        </div>
      </section>

      {/* Bento grid */}
      <section className="about-bento">
        {/* Mission — large card */}
        <article className="bento-card bento-mission">
          <span className="bento-label">Our Mission</span>
          <h2>
            Redefine how you <em>experience</em> Chennai.
          </h2>
          <p>
            Whether it's keeping you safe on a midnight commute or uncovering uncharted
            corners that even locals miss, Sancharam AI empowers every traveler with
            intelligent, context-aware tools. We believe a city this alive deserves a
            guide just as alive.
          </p>
          <div className="kolam-dots" aria-hidden="true">
            {Array.from({ length: 15 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
        </article>

        {/* Tall image card */}
        <article className="bento-card bento-image">
          <img src="/assets/images/index/temples.jpg" alt="Temple gopurams of Chennai" loading="lazy" />
          <div className="bento-image-caption">
            <span>Mylapore, Chennai</span>
          </div>
        </article>

        {/* Stat cards */}
        <article className="bento-card bento-stat">
          <span className="stat-number">120+</span>
          <span className="stat-label">Risk zones mapped &amp; monitored</span>
        </article>

        <article className="bento-card bento-stat bento-stat-moss">
          <span className="stat-number">300+</span>
          <span className="stat-label">Hidden gems community-verified</span>
        </article>

        <article className="bento-card bento-stat">
          <span className="stat-number">24×7</span>
          <span className="stat-label">Live safety &amp; routing intelligence</span>
        </article>

        {/* Technology — wide card */}
        <article className="bento-card bento-tech">
          <span className="bento-label">The Technology</span>
          <h2>Public data, made intuitive.</h2>
          <p>
            Advanced routing algorithms, real-time analytics, and community-verified data
            bridge the gap between public datasets and experiences that just feel right.
          </p>
          <ul className="tech-list">
            <li>
              <strong>Kaaval</strong> — live safety scoring from crime &amp; accident datasets
            </li>
            <li>
              <strong>Oor</strong> — safety-aware routing across the city grid
            </li>
            <li>
              <strong>Neram</strong> — itineraries that adapt to time, budget &amp; mood
            </li>
            <li>
              <strong>Unarvu</strong> — uncharted spots surfaced from local knowledge
            </li>
          </ul>
        </article>

        {/* Why Chennai */}
        <article className="bento-card bento-why">
          <span className="bento-label">Why Chennai</span>
          <p className="why-quote">
            “From the majestic columns of the High Court to the serene shores of Elliot's
            Beach — this city rewards the curious.”
          </p>
        </article>

        {/* Values */}
        <article className="bento-card bento-value">
          <Shield className="value-icon" size={26} strokeWidth={1.75} />
          <h3>Safety first</h3>
          <p>Every route and recommendation is scored against live risk data.</p>
        </article>

        <article className="bento-card bento-value">
          <Compass className="value-icon" size={26} strokeWidth={1.75} />
          <h3>Discovery</h3>
          <p>The best of Chennai isn't on the postcards — we help you find it.</p>
        </article>

        <article className="bento-card bento-value">
          <Users className="value-icon" size={26} strokeWidth={1.75} />
          <h3>Community</h3>
          <p>Verified by the people who walk these streets every day.</p>
        </article>
      </section>

      {/* CTA band */}
      <section className="about-cta">
        <div className="about-cta-card">
          {/* decorative layers */}
          <div className="cta-glow cta-glow-a" aria-hidden="true" />
          <div className="cta-glow cta-glow-b" aria-hidden="true" />
          <div className="cta-dots" aria-hidden="true" />
          <svg className="cta-contours" viewBox="0 0 1000 1000" aria-hidden="true">
            <path d="M0,200 Q250,150 500,200 T1000,200" stroke="#BA4D2D" strokeWidth="2" fill="none" />
            <path d="M0,400 Q250,350 500,400 T1000,400" stroke="#BA4D2D" strokeWidth="1" fill="none" />
            <path d="M0,600 Q250,550 500,600 T1000,600" stroke="#BA4D2D" strokeWidth="0.5" fill="none" />
          </svg>

          <div className="about-cta-inner">
            <h2>
              Ready to wander <em>smarter?</em>
            </h2>
            <p>Let Sancharam be your digital guide to unforgettable cultural odysseys.</p>
            <Link to="/features" className="about-cta-btn">
              <span>Start Exploring</span>
              <ArrowRight size={20} strokeWidth={2} className="cta-btn-arrow" />
              <span className="cta-btn-shine" aria-hidden="true" />
            </Link>
            <div className="cta-hint">
              <span className="cta-hint-rule" aria-hidden="true" />
              Navigate Chennai with Confidence
              <span className="cta-hint-rule" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
