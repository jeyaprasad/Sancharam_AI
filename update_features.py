import re

with open('src/pages/Features.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Hero Text
old_hero_text = """<h1>Where tradition meets <em>technology.</em></h1>"""
new_hero_text = """<h1 className="hero-title">Discover the Soul of <em>Madras</em></h1>
          <p className="hero-subtitle">
            Sancharam goes beyond standard maps. Experience deep heritage, real-time safety, 
            and hyper-local secrets wrapped in a next-generation digital guide.
          </p>"""
content = content.replace(old_hero_text, new_hero_text)

# Also fix the pill in hero to be more like before but matching design
content = re.sub(r'<span className="pill" lang="ta">.*?</span>', '<span className="pill" lang="ta"><i></i>நம்ம சென்னை</span>', content)

# 2. Add 5th Tab button
old_tabs = """<button className={`tab ${activeTab === 4 ? 'on' : ''}`} role="tab" aria-selected={activeTab === 4} onClick={() => setActiveTab(4)}>
          <span className="icon">O</span>
          <span className="lbl">Oor</span>
        </button>"""
new_tabs = """<button className={`tab ${activeTab === 4 ? 'on' : ''}`} role="tab" aria-selected={activeTab === 4} onClick={() => setActiveTab(4)}>
          <span className="icon">O</span>
          <span className="lbl">Oor</span>
        </button>
        <button className={`tab ${activeTab === 5 ? 'on' : ''}`} role="tab" aria-selected={activeTab === 5} onClick={() => setActiveTab(5)}>
          <span className="icon">₹</span>
          <span className="lbl">Payana Nidhi</span>
        </button>"""
content = content.replace(old_tabs, new_tabs)

# 3. Add 5th Panel
old_panels = """<div className={`panel ${activeTab === 4 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 4}>
          <div>
            <h3 lang="ta" style={{fontFamily: "'Tiro Tamil', serif", fontSize: '42px', fontWeight: 'bold', color: '#2c2c2c', marginBottom: '4px', lineHeight: 1.2}}>ஊர்</h3>
            <p style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '18px', fontStyle: 'italic', color: '#8B6914', marginBottom: '16px', marginTop: 0}}>Oor</p>
            <span style={{display: 'inline-block', fontSize: '11px', color: '#C0392B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Hyper-Local Discovery</span>
            <p style={{marginBottom: '32px'}}>6 Chennai zones. Hidden spots TripAdvisor will never show you. See through local eyes.</p>
            <Link to="/features/uncharted" className="go" style={{backgroundColor: '#000', color: '#fff', padding: '12px 28px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '15px'}}>Explore Oor &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/features/oor.jpg" alt="Oor" loading="lazy" />
          </div>
        </div>"""

new_panels = old_panels + """
        <div className={`panel ${activeTab === 5 ? 'on' : ''}`} role="tabpanel" hidden={activeTab !== 5}>
          <div>
            <h3 lang="ta" style={{fontFamily: "'Tiro Tamil', serif", fontSize: '42px', fontWeight: 'bold', color: '#2c2c2c', marginBottom: '4px', lineHeight: 1.2}}>பயண நிதி</h3>
            <p style={{fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: '18px', fontStyle: 'italic', color: '#8B6914', marginBottom: '16px', marginTop: 0}}>Payana Nidhi</p>
            <span style={{display: 'inline-block', fontSize: '11px', color: '#C0392B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px'}}>Smart Budgeting</span>
            <p style={{marginBottom: '32px'}}>Track expenses in INR, categorize automatically, and unlock gamified budget achievements.</p>
            <Link to="/features/budget" className="go" style={{backgroundColor: '#000', color: '#fff', padding: '12px 28px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '15px'}}>Track Budget &rarr;</Link>
          </div>
          <div className="panel-art">
            <img src="/assets/images/index/aerial-view.jpg" alt="Payana Nidhi" loading="lazy" />
          </div>
        </div>"""
content = content.replace(old_panels, new_panels)

# Fix corrupted tamil text in panels if any:
content = re.sub(r'<h3 lang="ta"[^>]*>r r _\?r</h3>', '<h3 lang="ta" style={{fontFamily: "\'Tiro Tamil\', serif", fontSize: \'42px\', fontWeight: \'bold\', color: \'#2c2c2c\', marginBottom: \'4px\', lineHeight: 1.2}}>உணர்வு</h3>', content)
content = re.sub(r'<h3 lang="ta"[^>]*>r"_.*?\?</h3>', '<h3 lang="ta" style={{fontFamily: "\'Tiro Tamil\', serif", fontSize: \'42px\', fontWeight: \'bold\', color: \'#2c2c2c\', marginBottom: \'4px\', lineHeight: 1.2}}>நேரம்</h3>', content)
content = re.sub(r'<h3 lang="ta"[^>]*>r r_rr_\?</h3>', '<h3 lang="ta" style={{fontFamily: "\'Tiro Tamil\', serif", fontSize: \'42px\', fontWeight: \'bold\', color: \'#2c2c2c\', marginBottom: \'4px\', lineHeight: 1.2}}>காவல்</h3>', content)
content = re.sub(r'<h3 lang="ta"[^>]*>rSr_\?</h3>', '<h3 lang="ta" style={{fontFamily: "\'Tiro Tamil\', serif", fontSize: \'42px\', fontWeight: \'bold\', color: \'#2c2c2c\', marginBottom: \'4px\', lineHeight: 1.2}}>ஊர்</h3>', content)

with open('src/pages/Features.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
