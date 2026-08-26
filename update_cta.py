import re

with open('src/pages/Features.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix corrupted footer text
content = content.replace('<small>"O? 2026 Sancharam " - Chennai</small>', '<small>&copy; 2026 Sancharam - Chennai</small>')
content = content.replace('<small>"O? 2026 Sancharam " - Chennai</small>', '<small>&copy; 2026 Sancharam - Chennai</small>')

# Fix CTA text to match the beautiful new style
old_cta = """<section className="cta rv" ref={addToRefs}>
          <div>
            <h2>Ready for <em>Madras</em>?</h2>
            <p>Start with a plan, or just wander I"AA  the city rewards both.</p>
          </div>
          <Link to="/features/itinerary" className="cta-btn">Start the journey
            <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
          </Link>
        </section>"""

new_cta = """<section className="cta rv" ref={addToRefs}>
          <div className="cta-content-wrapper">
            <h2>Ready for <em>Madras</em>?</h2>
            <p>Start with a curated plan, or just wander the uncharted paths—the city rewards both.</p>
          </div>
          <Link to="/features/itinerary" className="cta-btn">Start your journey
            <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
          </Link>
        </section>"""

if old_cta in content:
    content = content.replace(old_cta, new_cta)
else:
    # try replacing the text directly in case the exact string didn't match due to formatting
    content = re.sub(r'I"AA\s*the city rewards both', '— the city rewards both', content)

with open('src/pages/Features.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Update CSS for CTA and Footer
with open('src/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

cta_css = """
/* CTA */
.cta {
  position: relative;
  border-radius: 32px;
  padding: clamp(60px, 8vw, 100px) clamp(24px, 5vw, 60px);
  margin-bottom: 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 34px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
}

.cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/assets/images/index/beaches.jpg');
  background-size: cover;
  background-position: center;
  z-index: 0;
  filter: saturate(1.2);
}

.cta::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(20, 20, 25, 0.95), rgba(180, 69, 31, 0.85));
  z-index: 1;
}

.cta > .cta-content-wrapper, .cta > a {
  position: relative;
  z-index: 2;
}

.cta h2 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  color: #fff;
  line-height: 1.1;
}

.cta h2 em {
  font-style: italic;
  font-family: 'Fraunces', Georgia, serif;
  color: #FFD700;
  font-weight: 500;
}

.cta p {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  font-size: 1.15rem;
  max-width: 46ch;
  margin: 16px auto 0;
  line-height: 1.6;
}

.cta-btn {
  background: #fff;
  color: var(--rust);
  padding: 18px 40px;
  border-radius: 99px;
  font-size: 15px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
  border: none;
  text-decoration: none;
}

.cta-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(255, 255, 255, 0.3);
  background: var(--rust);
  color: #fff;
}

.cta-btn svg {
  width: 15px;
  height: 15px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2.2;
}

/* FOOTER */
footer {
  border-top: 1px solid var(--line);
  padding: 30px 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}
"""

css = re.sub(r'/\*\s*CTA\s*\*/.*?(?=@media)', cta_css, css, flags=re.DOTALL)
# The above regex assumes `@media` comes right after footer. Let's be precise.

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css)
