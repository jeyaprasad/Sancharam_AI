import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTamil, setShowTamil] = useState(false);

  const slides = [
    '/assets/images/chennai.jpg',
    '/assets/images/beaches.jpg',
    '/assets/images/lighthouse.jpg',
    '/assets/images/shoretemple.png',
    '/assets/images/church.jpg'
  ];

  // Slideshow Effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Language Toggle Effect
  useEffect(() => {
    const langInterval = setInterval(() => {
      setShowTamil(prev => !prev);
    }, 4000);
    return () => clearInterval(langInterval);
  }, []);

  return (
    <div className="home-center-container">
      {/* Background Slideshow */}
      <div className="home-center-slideshow">
        {slides.map((src, index) => (
          <img
            key={index}
            src={src}
            className={`home-slide ${index === currentSlide ? 'active' : ''}`}
            alt="Slideshow image"
          />
        ))}
        {/* Deep dark overlay to make centered text pop */}
        <div className="home-center-overlay"></div>
      </div>

      {/* Centered Content */}
      <div className="home-center-content">
        <div className="home-center-badge">
          <span lang="ta">நம்ம சென்னை</span>
        </div>

        <div className="home-title-wrapper">
          <h1 className={`home-center-title lang-text ${showTamil ? 'fade-out' : 'fade-in'}`}>
            Welcome to <br /> Chennai
          </h1>
          <h1 className={`home-center-title lang-text tamil-title ${showTamil ? 'fade-in' : 'fade-out'}`}>
            சென்னைக்கு <br /> வரவேற்கிறோம்
          </h1>
        </div>

        <p className="home-center-description">
          Experience the vibrant soul of the Detroit of India. From the majestic columns of the High Court to the serene shores of Elliot's Beach, let Sancharam be your digital guide to unforgettable cultural odysseys.
        </p>

        <div className="home-center-actions">
          <Link to="/features" className="home-center-cta-btn">
            Start Exploring
          </Link>
        </div>
      </div>

      <div className="home-center-footer">
        வாழ்க தமிழ் வளர்க தமிழ்
      </div>
    </div>
  );
};

export default Home;
