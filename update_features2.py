import re

with open('src/pages/Features.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we import useState
content = content.replace("import React, { useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';")
content = content.replace("const elementsRef = useRef([]);", "const [activeTab, setActiveTab] = useState(0);\n  const elementsRef = useRef([]);")

bento_grid_start = content.find('{/* 🔹 BENTO GRID (Horizontal Scroll) 🔹 */}')
bento_grid_end = content.find('{/* 🔹 MARQUEE 🔹 */}', bento_grid_start)

tabs_and_panels = """{/* 🔹 TABS & PANELS 🔹 */}
      <div className="tabs">
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

      <section className="panels rv" ref={addToRefs}>
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
        """

content = content[:bento_grid_start] + tabs_and_panels + content[bento_grid_end:]

with open('src/pages/Features.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
