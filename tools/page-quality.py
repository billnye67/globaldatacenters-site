# -*- coding: utf-8 -*-
"""Score every place report against the brief, and name the ones that fall short.

    python tools/page-quality.py            # summary + the pages that fail
    python tools/page-quality.py /data-centers/... # ONE page, before you push it
    python tools/page-quality.py --all      # every page, worst first
    python tools/page-quality.py --csv      # machine readable

This exists because the one-project county pages are the easiest place in the project to
half-write something, and "I checked and they're fine" is not evidence. The brief for those pages
is: what is proposed, what the risk or the fight is, what else is moving nearby, and what happens
next. Each of those leaves a mechanical trace, and a page missing several of them is either thin
or is reprinting a developer's announcement.

None of these checks can prove a page is TRUE. They catch shape, not accuracy: a page can pass
every one and still be wrong, which is what raw-text re-reading is for. What they catch is the
page nobody really reported.

**THIS IS NOT A WRITING TEMPLATE, AND WRITING TO IT WILL MAKE PAGES WORSE.**
It is a smell detector for whoever reviews. A page is a compiled investigation of one place: what
is proposed, what it does to the people there, what is contested, and what nobody knows yet. It
is not four boxes. A doctor writing up a new disease says how you catch it, what it does and what
is still unknown, in whatever order the evidence demands. They do not fill in a form.

So two checks exist to catch the opposite failure, a page written to a pattern:
  templated-opening  the first sentence has the same shape as other pages. Found on 21 pages when
                     this was written, eleven opening "X County's data center fight is in ...".
                     If several places read identically, nobody reported any of them.
  no-unknowns        the page never says what could not be established: who did not respond, what
                     figure was never disclosed, which decision has no date. Only 15% of pages did
                     this. The honest gap is often the most useful sentence on the page, and a
                     template always drops it. This is a NOTE, not a failure; some pages genuinely
                     have no open question.
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MONTHS = (r'January|February|March|April|May|June|July|August|September|October|November|December')
DATE = re.compile(r'\b(?:' + MONTHS + r')\s+\d{1,2},?\s+20\d\d|\b(?:' + MONTHS + r')\s+20\d\d')
SAID = re.compile(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z\'\-]+){0,3})\s+(?:said|told|says|asked|wrote|argued|warned|testified)')
SAID2 = re.compile(r'(?:said|says|told)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z\'\-]+){0,3})')
SAID3 = re.compile(r"\b(?:said|told|says|according to)\s+(?:the\s+)?[a-z\s]{0,40},?\s*([A-Z][A-Za-z\u00C0-\u024F\'\-]+)")
SAID4 = re.compile(r'\b(?:called it|described it as|put it)\b', re.I)
QUANT = re.compile(r'\b\d[\d,.\]*[\s\-]*'
                   r'(?:MW|GW|megawatts?|gigawatts?|kilowatts?|acres?|hectares?|kilolitres?|megalitres?|litres?|liters?|gallons?|million|billion|square f(?:ee|oo)t|jobs|homes|households)\b', re.I)
MONEY = re.compile(r'[$€£]\s?\d')
NEXT = re.compile(r'\b(vote|hearing|hearings|pending|scheduled|expects?|expected|application|reviewing|review|decision|deadline|appeal|due to|set to|slated|targeting|plans? to|hopes?|until|should be|next month|later this year|has yet to|still needs|awaiting|by 20\d\d|in 20\d\d|will decide|will consider|will vote|will rule|will hold|preparing|under way|underway|in progress|has begun|expected to|yet to)\b', re.I)
TENSION = re.compile(r'\b(oppos\w+|concern\w*|moratorium|moratoria|denied|deny|rejected|reject|appeal\w*|residents|objected|objection\w*|protest\w*|lawsuit|sued|petition|complain\w*|noise|water|drought|rate\w*payer|tax break|abatement|pause|freeze|setback|ban|bans|banned|grid|illegal|deficit|clear-cut|clear-cutting|scepticism|skepticism|scrutiny)\b', re.I)
NO_OPP = re.compile(r'\b(no organised|no organized|no local opposition|no opposition|nothing on the record|no reporting|did not turn up|no objection)\b', re.I)
UNKNOWN = re.compile(r"\b(not clear|unclear|not known|has not said|did not say|declined to|"
                     r"would not say|not disclosed|has not been disclosed|no estimate|"
                     r"did not respond|could not be reached|not yet known|remains unknown|"
                     r"no timeline|no date has been|could not be established|did not open|"
                     r"would not open|no reporting|not settled|nobody has said|no one has said|does not exist yet|has not been said|no article that opened|did not respond|declined to say|has not named|have not said|is not yet known|no result|gave no|without saying)\b", re.I)
PROMO = re.compile(r'\b(state-of-the-art|world-class|cutting-edge|leading provider|excited to|proud to|committed to delivering|transformational|game-chang\w+)\b', re.I)


def _depth(r):
    """Same ordering build-pages.js uses to pick a winner between duplicate urls."""
    return (len(r.get('sources') or []),
            sum(len(t.split()) for t in (r.get('paragraphs') or [])))


def load():
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
            if not r.get('paragraphs'):
                continue
            # Two lanes sometimes hold the same url. build-pages.js publishes the deeper one,
            # more sources then more words, so score THAT one; scoring whichever file sorted
            # first would grade a page the site does not serve.
            cur = out.get(u)
            if cur is None or _depth(r) > _depth(cur[1]):
                out[u] = (lane, r)
    return out


def opening_shape(s):
    """First seven words with proper nouns and numbers masked, so two pages about different
    places written to the same pattern collapse to the same string."""
    w = re.sub(r'\b[A-Z][a-z]+\b', 'X', s)
    w = re.sub(r'\d[\d,\.]*', 'N', w)
    return ' '.join(w.split()[:7])


def score(url, lane, r, shared_openings=frozenset()):
    paras = r.get('paragraphs') or []
    text = ' '.join(paras)
    srcs = r.get('sources') or []
    hosts = {s.split('/')[2] for s in srcs if '://' in s}
    words = len(text.split())

    fails = []
    if words < 250:
        fails.append('thin:%dw' % words)
    if len(srcs) < 2:
        fails.append('sources:%d' % len(srcs))
    if len(hosts) < 2:
        fails.append('one-outlet')
    if not DATE.search(text):
        fails.append('no-date')
    if not (SAID.search(text) or SAID2.search(text)
            or SAID3.search(text) or SAID4.search(text)):
        fails.append('nobody-speaks')
    if not (QUANT.search(text) or MONEY.search(text)):
        fails.append('no-figures')
    if not NEXT.search(text):
        fails.append('no-whats-next')
    if not (TENSION.search(text) or NO_OPP.search(text)):
        fails.append('no-stakes')
    # A company's own boast, quoted and attributed, is reporting. Only flag it when it appears
    # in the page's OWN voice, i.e. outside quotation marks.
    outside = re.sub(r'["“][^"”]{0,400}["”]', ' ', text)
    if PROMO.search(outside):
        fails.append('promo-language:' + PROMO.search(outside).group(0))
    if '"' not in text and '“' not in text:
        fails.append('no-quote')
    if paras and opening_shape(paras[0]) in shared_openings:
        fails.append('templated-opening')
    notes = [] if UNKNOWN.search(text) else ['no-unknowns']
    return words, len(srcs), len(hosts), fails, notes


def main():
    show_all = '--all' in sys.argv
    as_csv = '--csv' in sys.argv
    # Check ONE page before you push it. Every redo on this project happened because a fault was
    # found after the pages were written, so the cheapest check is the one that runs first.
    # Git Bash rewrites a bare leading slash into a Windows path, so '/company/microsoft/' arrives
    # as 'C:/Program Files/Git/company/microsoft/'. Accept either form, and a path with no leading
    # slash at all, which is what most people will type anyway.
    one = None
    for a in sys.argv[1:]:
        if a.startswith('--') or a in ('--all', '--csv'):
            continue
        t = a.replace(chr(92), '/')
        for mark in ('/company/', '/data-centers/'):
            if mark in t:
                t = mark + t.split(mark, 1)[1]
                break
        else:
            if t.startswith(('company/', 'data-centers/')):
                t = '/' + t
            else:
                continue
        one = '/' + t.strip('/') + '/'
        break
    D = load()
    # Which opening shapes appear on three or more pages. Computed across the whole corpus,
    # because a templated opening is only visible by comparison; no single page looks wrong.
    from collections import Counter
    shapes = Counter(opening_shape(r['paragraphs'][0]) for _, r in D.values() if r.get('paragraphs'))
    shared = frozenset(k for k, n in shapes.items() if n >= 3)

    rows = []
    for u, (lane, r) in D.items():
        w, ns, nh, fails, notes = score(u, lane, r, shared)
        rows.append((len(fails), w, u, lane, ns, nh, fails, notes))
    rows.sort(key=lambda x: (-x[0], x[1]))

    if one:
        hit = [r for r in rows if r[2] == one or r[2].rstrip('/') == one.rstrip('/')]
        if not hit:
            print('no page at %s (it must be written and saved in a lane file first)' % one)
            return
        nf, w, u, lane, ns, nh, fails, notes = hit[0]
        print('%s  lane %s' % (u, lane))
        print('  %d words, %d sources across %d outlets' % (w, ns, nh))
        if fails:
            print('  FLAGS: %s' % ' '.join(fails))
        if notes:
            print('  NOTE:  %s   (say what could not be established: who did not respond,'
                  ' what figure was never disclosed, what has no date yet)' % ' '.join(notes))
        if not fails and not notes:
            print('  clean')
        return

    if as_csv:
        print('fails,words,sources,hosts,lane,url,flags,notes')
        for nf, w, u, lane, ns, nh, fails, notes in rows:
            print('%d,%d,%d,%d,%s,%s,%s,%s' % (nf, w, ns, nh, lane, u, ' '.join(fails), ' '.join(notes)))
        return

    total = len(rows)
    clean = sum(1 for r in rows if r[0] == 0)
    print('%d pages scored. %d pass every check, %d have at least one flag.'
          % (total, clean, total - clean))
    print()
    c = Counter(f.split(':')[0] for r in rows for f in r[6])
    print('Flags by kind:')
    for k, n in c.most_common():
        print('   %-16s %4d' % (k, n))
    print()
    ws = sorted(r[1] for r in rows)
    print('Words: median %d, shortest %d, longest %d' % (ws[len(ws) // 2], ws[0], ws[-1]))
    print()
    tmpl = sum(1 for r in rows if 'templated-opening' in r[6])
    nounk = sum(1 for r in rows if r[7])
    print('Templated openings (shape shared with 2+ other pages): %d' % tmpl)
    print('Pages that never say what could not be established:    %d of %d' % (nounk, total))
    print()
    worst = [r for r in rows if r[0] >= 3]
    print('WORST: %d pages with 3 or more flags' % len(worst))
    for nf, w, u, lane, ns, nh, fails, notes in (rows if show_all else worst)[:60]:
        print('  %d flags  %4dw %ds/%dh  lane %s  %s' % (nf, w, ns, nh, lane, u))
        print('            %s' % ' '.join(fails + notes))


if __name__ == '__main__':
    main()
