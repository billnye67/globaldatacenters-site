"""Coordinator check: which cited articles say they were written or converted with AI?
    python tools/scan-ai-labels.py > report.txt
Reads every source URL cited by a project page (data/descriptions.json sentences) and by every place or
company report (data/place-reports*.json), fetches each once with tools/read-article.py (cached with
tools/verify-quotes.py's cache), and prints the pages citing any article whose text carries an AI-writing
label such as Scripps stations' "converted to this platform with the assistance of AI". Labels on images,
audio players and quotes about AI are ignored."""
import json, glob, os, re, sys, hashlib, subprocess, tempfile, unicodedata
from concurrent.futures import ThreadPoolExecutor

CACHE = os.path.join(tempfile.gettempdir(), 'vq-cache'); os.makedirs(CACHE, exist_ok=True)
LABEL = re.compile(r'(converted to this platform|was (produced|created|written|generated)|this (story|article|video) (was )?(created|written|generated|produced))[^.]{0,40}(assistance of ai|with ai\b|using ai\b|by ai\b|artificial intelligence)|with the assistance of ai|generated with the help of (openai|chatgpt|gpt)|elements of this article were created with help from', re.I)
NOT_TEXT = re.compile(r'audio version|representational image|image (was )?generated|illustration', re.I)

def norm(s):
    s = unicodedata.normalize('NFKC', s)
    return re.sub(r'\s+', ' ', s).strip().lower()

def text_of(url):
    f = os.path.join(CACHE, hashlib.md5(url.encode()).hexdigest() + '.txt')
    if os.path.exists(f): return open(f, encoding='utf-8').read()
    try:
        t = subprocess.run([sys.executable, 'tools/read-article.py', url], capture_output=True, text=True,
                           encoding='utf-8', errors='replace', timeout=90).stdout
    except Exception:
        t = ''
    t = norm(t)
    open(f, 'w', encoding='utf-8').write(t)
    return t

cites = {}
D = json.load(open('data/descriptions.json', encoding='utf-8'))
for pid, v in D.items():
    for s in v.get('sentences', []):
        u = str(s.get('src', ''))
        if u.startswith('http'): cites.setdefault(u, set()).add('project ' + pid)
for f in glob.glob('data/place-reports*.json'):
    for url, v in json.load(open(f, encoding='utf-8')).items():
        for s in v.get('sources', []):
            u = s if isinstance(s, str) else str(s.get('url', ''))
            if u.startswith('http'): cites.setdefault(u, set()).add('report ' + url)

urls = sorted(u for u in cites if not u.lower().split('?')[0].endswith('.pdf'))
with ThreadPoolExecutor(6) as ex:
    texts = dict(zip(urls, ex.map(text_of, urls)))
hits = 0
for u in urls:
    t = texts[u]
    m = LABEL.search(t)
    if m and not NOT_TEXT.search(t[max(0, m.start() - 80):m.end() + 20]):
        hits += 1
        print(f'LABEL  {u}\n       "{t[max(0, m.start() - 60):m.end() + 30]}"\n       cited by: {", ".join(sorted(cites[u]))}')
print(f'\n{len(urls)} sources checked, {hits} carry an AI-writing label')
