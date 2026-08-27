import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AboutPage = () => {
  return (
    <div className="features-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="features-hero-bg">
        <Navbar />
        <section className="hero wrap" style={{ padding: '120px 20px 60px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: '"Catamaran", sans-serif', fontSize: '4rem', color: 'var(--rust)', margin: '0 0 1rem' }}>About Sancharam AI</h1>
          <p style={{ fontSize: '1.2rem', color: '#fff', maxWidth: '800px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
            Built for the city that never sits still. Sancharam AI integrates live safety data, real-time routing, and hyper-local insights into a single ecosystem for Chennai.
          </p>
          <Link to="/" className="cta-btn" style={{ display: 'inline-flex', padding: '12px 28px', backgroundColor: '#FFD700', color: '#000', borderRadius: '99px', textDecoration: 'none', fontWeight: 'bold' }}>
            Return Home &rarr;
          </Link>
        </section>
      </div>
      <div style={{ flex: 1, background: '#0e0e17', padding: '4rem 2rem', color: '#ccc', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Our Mission</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '2rem' }}>
            We want to redefine how you experience Chennai. Whether it's ensuring your safety during a midnight commute or uncovering uncharted spots that even locals miss, Sancharam AI empowers every traveler with intelligent, context-aware tools.
          </p>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>The Technology</h2>
          <p style={{ lineHeight: '1.8' }}>
            Powered by advanced routing algorithms, real-time analytics, and community-verified data, our platform seamlessly bridges the gap between public datasets and intuitive user experiences.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
