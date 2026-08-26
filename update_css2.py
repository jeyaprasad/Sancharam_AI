import re

with open('src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Hero Title color and size to force one line
content = re.sub(
    r'\.bento-hero-title\s*\{[^\}]*\}',
    '''.bento-hero-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(2.5rem, 5vw, 4.2rem);
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

# 2. Navbar font
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

# 3. Number boxes and spacing (more space below number box)
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

content = re.sub(
    r'\.bento-stats\s*\{[^\}]*\}',
    '''.bento-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(16px, 4vw, 32px);
  padding-top: 32px;
  margin-bottom: 80px; /* Space below the number box */
}''',
    content
)

# Add the old Tabs and Panel CSS back!
tabs_css = """
/* TABS STYLES RESTORED */
.tabs {
  position: sticky;
  top: 72px;
  z-index: 90;
  background: rgba(251, 250, 247, 0.95);
  backdrop-filter: blur(12px);
  padding-top: 16px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 14px;
  margin-bottom: 26px;
  border-bottom: 1px solid var(--line);
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }

.tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 99px;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  border: 1px solid transparent;
  transition: all .3s var(--e);
  cursor: pointer;
  background: transparent;
}
.tab:hover {
  color: var(--ink);
  background: var(--wash);
}
.tab.on {
  color: var(--ink);
  background: var(--card);
  border-color: var(--line);
  box-shadow: 0 4px 12px rgba(0,0,0,.03);
  font-weight: 600;
}
.tab .icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--line);
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 700;
  color: var(--ink);
  transition: all .3s var(--e);
}
.tab.on .icon {
  background: var(--rust);
  color: #fff;
}

.panel {
  display: none;
  grid-template-columns: 1.1fr .9fr;
  gap: clamp(24px, 4vw, 40px);
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: clamp(20px, 3vw, 32px);
  box-shadow: 0 14px 40px rgba(26, 24, 21, .045);
  align-items: center;
  max-width: 980px;
  margin: 0 auto;
}
.panel.on {
  display: grid;
  animation: panelIn .45s var(--e) both;
}
@keyframes panelIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
.panel h3 {
  font-size: clamp(1.7rem, 3.2vw, 2.4rem);
  margin-bottom: 16px;
  font-family: 'Tiro Tamil', serif;
}
.panel-en-title {
  font-family: 'Fraunces', 'Playfair Display', serif;
  font-size: 18px;
  font-style: italic;
  color: #8B6914;
  margin-bottom: 16px;
  margin-top: 0;
}
.panel-tag {
  display: inline-block;
  font-size: 11px;
  color: #C0392B;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}
.panel p {
  color: var(--ink-2);
  font-weight: 300;
  line-height: 1.75;
  font-size: 1.02rem;
  margin-bottom: 32px;
}
.panel-go {
  background-color: #000;
  color: #fff;
  padding: 12px 28px;
  border-radius: 99px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
}
.panel-art {
  aspect-ratio: 16/10;
  border-radius: 14px;
  background: var(--wash);
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  overflow: hidden;
  position: relative;
}
.panel-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.panel:hover .panel-art img {
  transform: scale(1.05);
}
"""

content += tabs_css

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(content)
