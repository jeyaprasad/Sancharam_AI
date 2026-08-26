import re

with open('src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Hero Title (Discover the Soul of Madras)
# Put in one line, black color.
content = re.sub(
    r'\.bento-hero-title\s*\{[^\}]*\}',
    '''.bento-hero-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(2rem, 5vw, 4.2rem);
  color: var(--ink);
  line-height: 1.1;
  margin-bottom: 16px;
  white-space: nowrap;
}
.bento-hero-title em {
  color: var(--ink);
  font-style: italic;
}''',
    content
)

# 2. Nav Bar Font Style
content = re.sub(
    r'nav a\s*\{\s*font-family:[^\}]*\}',
    '''nav a {
  font-family: 'Catamaran', sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  transition: color .25s;
  position: relative;
  padding: 8px 0;
}''',
    content
)

# 3. Number Boxes (.bento-stat)
content = re.sub(
    r'\.bento-stat\s*\{[^\}]*\}',
    '''.bento-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 20px 32px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  backdrop-filter: blur(8px);
}''',
    content
)
# Ensure .bento-stats has no padding-top and handles wrap
content = re.sub(
    r'\.bento-stats\s*\{[^\}]*\}',
    '''.bento-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(16px, 4vw, 32px);
  padding-top: 32px;
}''',
    content
)

# 4. Scroll Layout for Features (.bento-grid)
# Replace existing .bento-grid and .bento-card layout styles
content = re.sub(
    r'\.bento-grid\s*\{[^\}]*\}',
    '''.bento-grid {
  display: flex;
  overflow-x: auto;
  gap: 24px;
  padding: 0 40px 80px 40px;
  margin-top: -40px;
  position: relative;
  z-index: 10;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.bento-grid::-webkit-scrollbar {
  display: none;
}''',
    content
)

content = re.sub(
    r'\.bento-card\s*\{[^\}]*\}',
    '''.bento-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  text-decoration: none;
  background: var(--card);
  min-width: 320px;
  width: 28vw;
  max-width: 400px;
  flex: 0 0 auto;
  scroll-snap-align: center;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}''',
    content
)

# Remove the large and wide overrides completely as they are not needed in horizontal scroll
content = re.sub(r'\.bento-large\s*\{[^\}]*\}', '', content)
content = re.sub(r'\.bento-wide\s*\{[^\}]*\}', '', content)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(content)
