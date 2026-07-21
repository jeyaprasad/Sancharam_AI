import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [typedText, setTypedText] = useState('');
  const textsToType = ["Welcome to Chennai", "சிங்காரச் சென்னை"];
  
  const slides = [
    '/assets/images/chennai.jpg',
    '/assets/images/beaches.jpg',
    '/assets/images/lighthouse.jpg',
    '/assets/images/walls.jpg',
    '/assets/images/church.jpg'
  ];

  // Slideshow Effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Typing Effect
  useEffect(() => {
    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout;

    const typeText = () => {
      const currentStringArr = Array.from(textsToType[stringIndex]);

      if (isDeleting) {
        setTypedText(currentStringArr.slice(0, charIndex - 1).join(''));
        charIndex--;
      } else {
        setTypedText(currentStringArr.slice(0, charIndex + 1).join(''));
        charIndex++;
      }

      let typeSpeed = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === currentStringArr.length) {
        typeSpeed = 2500; // Pause at the end of the word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        stringIndex = (stringIndex + 1) % textsToType.length;
        typeSpeed = 500; // Pause before typing the next word
      }

      timeout = setTimeout(typeText, typeSpeed);
    };

    timeout = setTimeout(typeText, 500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="home-container">
      <div className="slideshow-container">
        {/* Slideshow Images */}
        {slides.map((src, index) => (
          <img 
            key={index} 
            src={src} 
            className={`slide ${index === currentSlide ? 'active' : ''}`} 
            alt="Slideshow image"
          />
        ))}

        <div className="overlay">
          <div className="namma-chennai-badge">நம்ம சென்னை</div>
          <h1>{typedText}</h1>
          <p className="chennai-subline">
            Experience the vibrant soul of the Detroit of India. From the majestic columns of the High Court to the serene shores of Elliot's Beach, let Sancharam be your digital guide to unforgettable cultural odysseys.
          </p>
          <Link to="/features" className="next-button">Start Exploring →</Link>
        </div>

        <p className="tamil-bottom">வாழ்க தமிழ் வளர்க தமிழ்</p>
      </div>
    </div>
  );
};

export default Home;
