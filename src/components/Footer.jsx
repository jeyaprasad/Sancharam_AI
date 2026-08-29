import React from 'react';
import { Link } from '@/lib/router-compat';

const Footer = () => {
  return (
    <footer style={{ background: '#0a0a0f', borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '1rem 0' }}>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <small style={{ color: '#666', fontSize: '0.8rem' }}>&copy; 2026 சஞ்சாரம் - Proudly built in Chennai.</small>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ec4b6', display: 'inline-block', boxShadow: '0 0 6px rgba(46,196,182,0.6)' }}></span>
          <small style={{ color: '#888', fontSize: '0.8rem' }}>All systems operational</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
