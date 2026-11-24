"""Coordinator check, independent of the lanes: is every quotation on a page word for word in the article
its sentence cites?
    python tools/verify-quotes.py [letters...]      (default: every story-*.json in data/projects-run)
Opens each cited URL once with tools/read-article.py (raw text; PDFs through pdftotext), then looks for each
"double-quoted" passage of 4+ words, split at ellipses. Prints only the misses, then a count. A miss means
"read this one by hand": pages that block scripts, and quotes the page itself tidied, both land here."""
import json, re, subprocess, sys, os, glob, tempfile, hashlib, unicodedata

def norm(s):
    s = unicodedata.normalize('NFKC', s)
    for a, b in (('’', "'"), ('‘', "'"), ('“', '"'), ('”', '"'), ('–', '-'), ('—', '-'), (' ', ' '), ('­', '')):
        s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s).strip().lower()

CACHE = os.path.join(tempfile.gettempdir(), 'vq-cache'); os.makedirs(CACHE, exist_ok=True)
def text_of(url):
    f = os.path.join(CACHE, hashlib.md5(url.encode()).hexdigest() + '.txt')
    if os.path.exists(f): return open(f, encoding='utf-8').read()
    t = ''
    try:
        if url.lower().split('?')[0].endswith('.pdf') or '/ViewFile/' in url or 'DocumentCenter/View' in url:
            pdf = f + '.pdf'
            subprocess.run(['curl', '-s', '-L', '-A', 'Mozilla/5.0', url, '-o', pdf], timeout=60)
            t = subprocess.run(['pdftotext', pdf, '-'], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=60).stdout
            if not t.strip():
                t = subprocess.run([sys.executable, 'tools/read-article.py', url], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=90).stdout
        else:
            t = subprocess.run([sys.executable, 'tools/read-article.py', url], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=90).stdout
    except Exception:
        t = ''
    t = norm(t)
    open(f, 'w', encoding='utf-8').write(t)
    return t

letters = sys.argv[1:] or sorted(os.path.basename(p)[6:-5] for p in glob.glob('data/projects-run/story-*.json'))
checked = missed = unread = 0
for L in letters:
    for rec in json.load(open(f'data/projects-run/story-{L}.json', encoding='utf-8')):
        for s in rec.get('sentences', []):
            src, t = str(s.get('src', '')), str(s.get('t', ''))
            if not src.startswith('http'): continue
            for q in re.findall(r'["“]([^"”]{12,})["”]', t):
                parts = [p for p in re.split(r'\s*(?:\.\.\.|…)\s*', norm(q)) if len(p.split()) >= 3]
                if not parts: continue
                checked += 1
                body = text_of(src)
                if len(body) < 2500:   # a paywall stub or a page that needs scripts: read it by hand
                    unread += 1; print(f'UNREAD  {L} {rec["id"]}  {src[:90]}'); continue
                if not all(p.strip(' .,;:') in body for p in parts):
                    missed += 1; print(f'MISSING {L} {rec["id"]}  "{q[:120]}"  <- {src[:90]}')
print(f'\n{checked} quotes checked, {missed} not found word for word, {unread} in sources the script could not read')
