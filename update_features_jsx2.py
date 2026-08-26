with open('src/pages/Features.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Break bento-grid out of the wrap so it spans full width
old_grid_start = """      <div className="wrap">
        {/* 🔹 BENTO GRID 🔹 */}
        <section className="bento-grid rv" ref={addToRefs}>"""
new_grid_start = """      {/* 🔹 BENTO GRID (Horizontal Scroll) 🔹 */}
      <section className="bento-grid rv" ref={addToRefs}>"""
content = content.replace(old_grid_start, new_grid_start)

# 2. Put the wrap back around the marquee and CTA
old_marquee_start = """        {/* 🔹 MARQUEE 🔹 */}
        <div className="marquee rv" ref={addToRefs}>"""
new_marquee_start = """      <div className="wrap">
        {/* 🔹 MARQUEE 🔹 */}
        <div className="marquee rv" ref={addToRefs}>"""
content = content.replace(old_marquee_start, new_marquee_start)

# 3. Clean up the card classes and split contents
content = content.replace('className="bento-card bento-large"', 'className="bento-card"')
content = content.replace('className="bento-card bento-wide"', 'className="bento-card"')

old_split = """              <div className="bento-card-content-split">
                <div>
                  <span className="bento-tag">Hyper-Local Discovery</span>
                  <h3 lang="ta">ஊர்</h3>
                  <p className="bento-title-en">Oor</p>
                </div>
                <div>
                  <p className="bento-desc">6 Chennai zones. Hidden spots TripAdvisor will never show you. See through local eyes and uncover the city's best kept secrets.</p>
                  <span className="bento-action">Discover Secrets &rarr;</span>
                </div>
              </div>"""

new_split = """              <span className="bento-tag">Hyper-Local Discovery</span>
              <h3 lang="ta">ஊர்</h3>
              <p className="bento-title-en">Oor</p>
              <p className="bento-desc">6 Chennai zones. Hidden spots TripAdvisor will never show you. See through local eyes and uncover the city's best kept secrets.</p>
              <span className="bento-action">Discover Secrets &rarr;</span>"""
content = content.replace(old_split, new_split)

# 4. Add the 5th Feature (Budget Tracker)
budget_card = """          <Link to="/features/budget" className="bento-card">
            <div className="bento-card-bg">
              <img src="/assets/images/index/aerial-view.jpg" alt="Payana Nidhi" loading="lazy" />
              <div className="bento-card-gradient"></div>
            </div>
            <div className="bento-card-content">
              <span className="bento-tag">Smart Budgeting</span>
              <h3 lang="ta">பயண நிதி</h3>
              <p className="bento-title-en">Payana Nidhi</p>
              <p className="bento-desc">Track expenses in INR, categorize automatically, and unlock gamified budget achievements.</p>
              <span className="bento-action">Track Budget &rarr;</span>
            </div>
          </Link>
        </section>"""

content = content.replace('          </Link>\n          \n        </section>', '          </Link>\n\n' + budget_card)

with open('src/pages/Features.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
