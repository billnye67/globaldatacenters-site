"""Coordinator check: does each record fix's quoted proof actually appear in the source it names?
    python tools/verify-fixes.py data/projects-run/fix-c.json
For every fix, takes each "double-quoted" passage in `why` and the URLs in `why`, opens each URL with
tools/read-article.py (raw text, never a summary; PDFs through pdftotext) and reports whether the passage
is in it. It judges nothing else: a FOUND is a quote that exists, not a fix that is right."""
import json, re, subprocess, sys, os, tempfile, unicodedata

def norm(s):
    s = unicodedata.normalize('NFKC', s).replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    return re.sub(r'\s+', ' ', s).strip().lower()

cache = {}
def text_of(url):
    if url in cache: return cache[url]
    t = ''
    try:
        if url.lower().split('?')[0].endswith('.pdf') or '/ViewFile/' in url:
            f = os.path.join(tempfile.gettempdir(), 'vf.pdf')
            subprocess.run(['curl', '-s', '-L', '-A', 'Mozilla/5.0', url, '-o', f], timeout=60)
            t = subprocess.run(['pdftotext', f, '-'], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=60).stdout
        else:
            t = subprocess.run([sys.executable, 'tools/read-article.py', url], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=90).stdout
    except Exception as e:
        t = ''
    cache[url] = norm(t)
    return cache[url]

fixes = json.load(open(sys.argv[1], encoding='utf-8'))
for pid, f in fixes.items():
    why = str(f.get('why', ''))
    changed = {k: v for k, v in f.items() if k not in ('why', 'sources_add', 'sources_drop')}
    urls = [u.rstrip(').,;') for u in re.findall(r'https?://[^\s)"]+', why)]
    quotes = [q for q in re.findall(r'"([^"]{12,})"', why)]
    if not changed:
        continue
    print(f'\n{pid}  {json.dumps(changed)[:160]}')
    if not quotes: print('   (no quoted proof in why)'); continue
    if not urls: print('   (no URL in why)'); continue
    texts = [text_of(u) for u in urls]
    for q in quotes:
        parts = [p for p in re.split(r'\s*(?:\.\.\.|…)\s*', q) if len(p) > 8]
        hit = all(any(norm(p) in t for t in texts) for p in parts) if parts else False
        print(f'   {"FOUND  " if hit else "MISSING"} "{q[:110]}"')
