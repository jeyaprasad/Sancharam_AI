with open('src/pages/Features.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the grid wrapper
content = content.replace('<div className="wrap">\n        {/* 🔹 BENTO GRID 🔹 */}\n        <section className="bento-grid rv" ref={addToRefs}>', '</div>\n\n      {/* 🔹 BENTO GRID (Horizontal Scroll) 🔹 */}\n      <section className="bento-grid rv" ref={addToRefs}>')

# 2. Put the wrap back around the marquee and CTA
content = content.replace('{/* 🔹 MARQUEE 🔹 */}', '<div className="wrap">\n        {/* 🔹 MARQUEE 🔹 */}')

# 3. Clean up the card classes and split contents
content = content.replace('className="bento-card bento-large"', 'className="bento-card"')
content = content.replace('className="bento-card bento-wide"', 'className="bento-card"')
content = content.replace('<div className="bento-card-content-split">\n                <div>\n                  <span className="bento-tag">Hyper-Local Discovery</span>\n                  <h3 lang="ta">ஊர்</h3>\n                  <p className="bento-title-en">Oor</p>\n                </div>\n                <div>\n                  <p className="bento-desc">6 Chennai zones. Hidden spots TripAdvisor will never show you. See through local eyes and uncover the city\'s best kept secrets.</p>\n                  <span className="bento-action">Discover Secrets &rarr;</span>\n                </div>\n              </div>', '<span className="bento-tag">Hyper-Local Discovery</span>\n              <h3 lang="ta">ஊர்</h3>\n              <p className="bento-title-en">Oor</p>\n              <p className="bento-desc">6 Chennai zones. Hidden spots TripAdvisor will never show you. See through local eyes and uncover the city\'s best kept secrets.</p>\n              <span className="bento-action">Discover Secrets &rarr;</span>')

# 4. Add the 5th Feature (Budget Tracker)
budget_card = """
          <Link to="/features/budget" className="bento-card">
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
"""

content = content.replace('</section>', budget_card + '        </section>')

with open('src/pages/Features.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
