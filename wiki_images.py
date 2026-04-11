import json
import urllib.request
import urllib.parse
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

html_path = 'd:/Coding/Hackathon/Sancharam/features/uncharted.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

pattern = re.compile(r'<img src="https://picsum\.photos/seed/[^/]+/400/300"\s+alt="([^"]+)"\s+class="gem-img"\s*loading="lazy">')

def get_wiki_img(query):
    search_query = query
    if "Chennai" not in query and "Godowns" not in query:
        search_query = query + " Chennai"
        
    search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(search_query)}&utf8=&format=json&srlimit=1"
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'SancharamHackathonScraper/1.0 (https://sancharam.app)'})
        res = json.loads(urllib.request.urlopen(req, context=ctx).read())
        if res['query']['search']:
            title = res['query']['search'][0]['title']
            img_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&format=json&pithumbsize=600"
            req2 = urllib.request.Request(img_url, headers={'User-Agent': 'SancharamHackathonScraper/1.0'})
            res2 = json.loads(urllib.request.urlopen(req2, context=ctx).read())
            pages = res2['query']['pages']
            for page_id in pages:
                if 'thumbnail' in pages[page_id]:
                    return pages[page_id]['thumbnail']['source']
    except Exception as e:
        pass
    return None

matches = pattern.findall(html)
print(f"Found {len(matches)} tags to process.")

replacements = {}
for alt in set(matches):
    url = get_wiki_img(alt)
    if url:
        replacements[alt] = url
        print(f"SUCCESS: {alt} -> {url}")
    else:
        print(f"FAILED: {alt}")

def replacer(match):
    alt = match.group(1)
    if alt in replacements:
        return f'<img src="{replacements[alt]}" alt="{alt}" class="gem-img" loading="lazy" style="object-fit:cover;">'
    else:
        # Fallback to a curated local default if Wiki fails
        return f'<img src="../assets/images/real/royapuram.png" alt="{alt}" class="gem-img" loading="lazy">'

if replacements:
    new_html = pattern.sub(replacer, html)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("HTML updated.")
