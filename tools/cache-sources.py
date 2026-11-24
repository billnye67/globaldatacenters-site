# -*- coding: utf-8 -*-
"""Fetch every source cited on every page, in full, into a local cache.

    python tools/cache-sources.py [lane-letter ...]

Costs no searches: every url is already recorded on a page. Resumable; re-running skips what is
already cached. The hand-read wave needs this, because a reviewer should be reading the article,
not waiting on the network, and because the same source is cited by several pages.

Writes <cache>/<md5>.txt per url and <cache>/_index.json mapping url -> {chars, failed, file}.
"""
import io, json, os, subprocess, sys, hashlib, re, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.source-cache')
IDX = os.path.join(CACHE, '_index.json')


def urls_of(rep):
    """Lane files disagree about the shape of `sources`. Lane g stores
    {title, publisher, url} objects; everyone else stores plain strings. Reported by lane g after
    both tools crashed on it with "unhashable type: dict"."""
    out = []
    for x in (rep.get('sources') or []):
        u = x.get('url') if isinstance(x, dict) else x
        if u:
            out.append(u)
    return out


def load_index():
    """Read the index fresh. Several lanes cache at once, and a run that writes back only its own
    in-memory copy destroys everyone else's entries: lane g came back from a run to find 14 of 463
    urls still listed. Always merge with what is on disk."""
    if not os.path.exists(IDX):
        return {}
    try:
        return json.load(io.open(IDX, encoding='utf-8'))
    except Exception:
        return {}


def save_index(idx):
    """Merge with disk, then replace atomically, so a concurrent run cannot lose entries."""
    merged = load_index()
    merged.update(idx)
    fd, tmp = tempfile.mkstemp(dir=CACHE, suffix='.tmp')
    os.close(fd)
    io.open(tmp, 'w', encoding='utf-8').write(json.dumps(merged, ensure_ascii=False, indent=1))
    os.replace(tmp, IDX)
    return merged


def reports():
    out = {}
    for f in sorted(os.listdir(os.path.join(ROOT, 'data'))):
        m = re.match(r'place-reports(?:-([a-z]))?\.json$', f)
        if not m:
            continue
        lane = m.group(1) or 'a'
        try:
            d = json.load(io.open(os.path.join(ROOT, 'data', f), encoding='utf-8'))
        except Exception:
            continue
        for u, r in d.items():
            if r.get('paragraphs'):
                out.setdefault(u, (lane, r))
    return out


def main():
    want = set(a for a in sys.argv[1:] if len(a) == 1)
    os.makedirs(CACHE, exist_ok=True)
    idx = load_index()
    urls = []
    for u, (lane, r) in reports().items():
        if want and lane not in want:
            continue
        urls += urls_of(r)
    urls = sorted(set(urls))
    todo = [u for u in urls if u not in idx]
    print('%d sources, %d already cached, %d to fetch' % (len(urls), len(urls) - len(todo), len(todo)), flush=True)
    env = dict(os.environ, PYTHONIOENCODING='utf-8')
    for i, s in enumerate(todo, 1):
        key = hashlib.md5(s.encode()).hexdigest()
        txt = ''
        for attempt in (1, 2):
            try:
                p = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'read-article.py'), s],
                                   capture_output=True, env=env, timeout=180,
                                   stdin=subprocess.DEVNULL)
                txt = p.stdout.decode('utf-8', 'replace')
            except Exception:
                txt = ''
            body_len = len(txt.split(chr(10) + chr(10), 1)[1]) if (chr(10) + chr(10)) in txt else len(txt)
            if body_len >= 400:
                break     # got it; otherwise try once more before recording a failure
        body = txt.split('\n\n', 1)[1] if '\n\n' in txt else txt

        # read-article.py cannot extract a PDF. It returns the raw bytes, which are long, so
        # the length test below called the source readable, and check-names then reported
        # every genuine name on a PDF-sourced page as invented. Found by lane n, which had
        # already worked around it by verifying its Isabella and Calloway meeting minutes with
        # pypdf. Extract properly where pypdf is installed; where it is not, record the source
        # as unreadable rather than pretending it was read. 22 citations on 18 pages are PDFs.
        if '%PDF' in body[:2048] or s.lower().split('?')[0].endswith('.pdf'):
            text = ''
            try:
                import pypdf, urllib.request
                req = urllib.request.Request(s, headers={'User-Agent': 'Mozilla/5.0'})
                raw = urllib.request.urlopen(req, timeout=120).read()
                pdfpath = os.path.join(CACHE, key + '.pdf')
                io.open(pdfpath, 'wb').write(raw)
                rdr = pypdf.PdfReader(pdfpath)
                pages_text = []
                for pg in rdr.pages:
                    try:
                        pages_text.append(pg.extract_text() or '')
                    except Exception:
                        pass
                text = chr(10).join(pages_text)
            except Exception:
                text = ''
            if len(text) >= 400:
                body = text
            else:
                idx[s] = {'chars': 0, 'failed': True, 'file': key + '.txt',
                          'note': 'pdf could not be extracted'}
                continue

        idx[s] = {'chars': len(body), 'failed': len(body) < 400, 'file': key + '.txt'}
        if body:
            io.open(os.path.join(CACHE, key + '.txt'), 'w', encoding='utf-8').write(s + '\n\n' + body)
        if i % 25 == 0:
            idx = save_index(idx)
            print('  %d/%d' % (i, len(todo)), flush=True)
    idx = save_index(idx)
    ok = sum(1 for v in idx.values() if not v['failed'])
    print('cached %d urls, %d readable, %d would not open' % (len(idx), ok, len(idx) - ok), flush=True)


if __name__ == '__main__':
    main()
