import re

for page in ['src/pages/RoutingPage.jsx', 'src/pages/SafetyPage.jsx', 'src/pages/ItineraryPage.jsx']:
    with open(page, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    seen = set()
    new_lines = []
    for line in lines:
        if line.startswith('import '):
            if line in seen:
                continue
            seen.add(line)
        new_lines.append(line)
        
    with open(page, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
