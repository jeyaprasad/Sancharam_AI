import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TABS_DATA = [
  {
    id: 0,
    tabLabel: 'Sentinel 01',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    tamilTitle: 'Kaavalar Paathaikal',
    englishSubtitle: 'Sentinel Trails',
    description: 'Venture off the beaten path with confidence. Sentinel Trails curates scenic routes through lesser-known neighborhoods, enhanced with real-time safety insights from local authorities and traveler feedback. Discover hidden gems while prioritizing your well-being.',
    tags: ['Scenic Routes', 'Safety Insights', 'Hidden Gems'],
    buttonText: 'Explore trails →',
    link: '/features/safety',
    artIcon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D9653B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  },
  {
    id: 1,
    tabLabel: 'Sacred 02',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    tamilTitle: 'Aalayam & Anmeegam',
    englishSubtitle: 'Sacred Spaces',
    description: 'Experience the spiritual heart of Tamil Nadu. Discover ancient heritage shrines, sacred ritual traditions, temple etiquette guidelines, and peak-hour crowd insights.',
    tags: ['Heritage Shrines', 'Temple Etiquette', 'Spiritual Walks'],
    buttonText: 'Discover sacred spots →',
    link: '/features/uncharted',
    artIcon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D9653B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )
  },
  {
    id: 2,
    tabLabel: 'Heritage 03',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    tamilTitle: 'Parambariya Payanam',
    englishSubtitle: 'Heritage & Timelines',
    description: 'Step back in time through curated historical journeys. Explore Chola architecture, colonial landmarks, and living culture with adaptive AI daily schedules.',
    tags: ['Chola Architecture', 'Historical Journeys', 'Fluid Schedules'],
    buttonText: 'Plan itinerary →',
    link: '/features/itinerary',
    artIcon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D9653B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    )
  },
  {
    id: 3,
    tabLabel: 'Guardian 04',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    tamilTitle: 'Kavasam & Kaappu',
    englishSubtitle: 'Guardian Shield',
    description: 'Your personal safety companion with live GPS location tracking, real-time risk scores, 1-tap emergency police dispatch, and WhatsApp location sharing.',
    tags: ['Live Location', 'Emergency SOS', 'Risk Score'],
    buttonText: 'Activate Guardian →',
    link: '/features/blockchain',
    artIcon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D9653B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  },
  {
    id: 4,
    tabLabel: 'Tribes 05',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    tamilTitle: 'Namma Nanbargal',
    englishSubtitle: 'Travel Tribes',
    description: 'Connect with like-minded travelers and unlock community-sourced wisdom. Exchange cryptographically verified tips, join interest circles, and explore together.',
    tags: ['Community Tips', 'Verified Hash-Chain', 'Travel Circles'],
    buttonText: 'Join a tribe →',
    link: '/features/tribes',
    artIcon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D9653B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
];

const Features = () => {
  const [activeTab, setActiveTab] = useState(0);
  const currentTab = TABS_DATA[activeTab];

  return (
    <div
      style={{
        backgroundColor: '#FAF7F2',
        minHeight: '100vh',
        color: '#1A1A1A',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* ── HEADER ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          padding: '1.25rem 3rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          backgroundColor: '#FAF7F2',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          backdropFilter: 'blur(12px)'
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginRight: '2rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            flexShrink: 0
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D9653B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <span
            style={{
              fontFamily: "'Fraunces', 'Playfair Display', serif",
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#1A1A1A',
              letterSpacing: '-0.5px'
            }}
          >
            Sancharam
          </span>
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
          >
            Home
          </Link>
          <Link
            to="/features"
            style={{
              color: '#1A1A1A',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '600',
              borderBottom: '2px solid #D9653B',
              paddingBottom: '4px'
            }}
          >
            Features
          </Link>
          <Link
            to="/features/itinerary"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
          >
            Planner
          </Link>
          <Link
            to="/features/budget"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
          >
            Budget
          </Link>
        </nav>
      </header>

      {/* ── MAIN CONTENT WRAPPER ── */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem 6rem 2rem' }}>
        {/* Sub-heading text */}
        <p
          style={{
            fontSize: '1.05rem',
            color: '#666',
            lineHeight: '1.6',
            maxWidth: '560px',
            marginBottom: '3rem'
          }}
        >
          Each module works standalone, but they share one map, one dataset and one sense of the city. Pick a direction.
        </p>

        {/* ── TABS ROW ── */}
        <div
          role="tablist"
          aria-label="Features Tabs"
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          {TABS_DATA.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '50px',
                  border: 'none',
                  backgroundColor: isSelected ? '#1A1A1A' : 'transparent',
                  color: isSelected ? '#FFFFFF' : '#666',
                  fontSize: '0.9rem',
                  fontWeight: isSelected ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  outline: 'none',
                  boxShadow: isSelected ? '0 4px 15px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', opacity: isSelected ? 1 : 0.7 }}>
                  {tab.icon}
                </span>
                <span>{tab.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* ── ACTIVE TAB CONTENT CARD ── */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #EBE6DC',
            padding: '3.5rem',
            boxShadow: '0 12px 40px rgba(0,0,0,0.03)',
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '3rem',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Details */}
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif",
                fontSize: '2.6rem',
                fontWeight: '700',
                color: '#1A1A1A',
                margin: '0 0 0.25rem 0',
                letterSpacing: '-0.5px'
              }}
            >
              {currentTab.tamilTitle}
            </h1>

            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: '500',
                color: '#888',
                margin: '0 0 1.5rem 0'
              }}
            >
              {currentTab.englishSubtitle}
            </h2>

            <p
              style={{
                fontSize: '1rem',
                color: '#555',
                lineHeight: '1.65',
                marginBottom: '2rem'
              }}
            >
              {currentTab.description}
            </p>

            {/* Tag Pills */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.2rem' }}>
              {currentTab.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: '#EAF2EC',
                    color: '#2E5A39',
                    padding: '0.4rem 0.95rem',
                    borderRadius: '50px',
                    fontSize: '0.82rem',
                    fontWeight: '600'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Button */}
            <Link
              to={currentTab.link}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
                padding: '0.85rem 1.75rem',
                borderRadius: '50px',
                fontWeight: '600',
                fontSize: '0.92rem',
                textDecoration: 'none',
                transition: 'transform 0.2s ease, background-color 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
              }}
            >
              {currentTab.buttonText}
            </Link>
          </div>

          {/* Right Column: Visual Artwork Placeholder Box */}
          <div
            style={{
              backgroundColor: '#F3EFE6',
              borderRadius: '20px',
              height: '100%',
              minHeight: '290px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
            }}
          >
            {currentTab.artIcon}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Features;
