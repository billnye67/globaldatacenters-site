# -*- coding: utf-8 -*-
"""Find names and figures on a page that appear in none of its own sources.

    python tools/cache-sources.py            # once, fetches every cited source in full
    python tools/check-names.py              # every page
    python tools/check-names.py data-centers/united-states/iowa/story-county/
    python tools/check-names.py --lane m

Why this exists. Lane m caught itself putting the wrong mayor's name on the Hartford page from
memory, noticed before pushing, and started greping every proper noun against the saved source
text. That is the right habit and it should not depend on remembering to do it.

A name written from memory is the most dangerous error this project can make. It is fluent,
specific, plausible, and invisible to every other check: the page reads better for having it, the
quote checker passes because no quotation is involved, and the word count goes up. The only way to
catch it is to ask whether the string appears in an article somebody actually fetched.

What it reports:
  NAME NOT IN SOURCES     a capitalised name on the page that no cited source contains
  FIGURE NOT IN SOURCES   a number with a unit that no cited source contains

What it cannot do: it does not know whether a name is attached to the right person, place or
claim. Lane m's mayor would have been caught only if the wrong name were absent from the sources
entirely. It also cannot see through a source that would not fetch. Treat a clean run as "nothing
obviously invented", not as "verified".

Expect false positives and read them rather than acting on them:
  - a source that did not fetch, so nothing in it can be matched. These are listed separately.
  - a name the page spells out and the source abbreviates, or vice versa
  - translated or transliterated names, which will differ from the original-language source
  - possessives and inflections, which are stripped before matching but not perfectly
  - an author's byline. read-article.py collects the article body and drops the byline, so a
    commentary or opinion piece cited by its author's name flags every time. Lane n hit this with
    Adam Young on Idaho; the figures in the piece all matched. Check the figures, not the byline.
  - a translated or transliterated name, where the original script is what the source contains.
    Lane n spot-checked its Chinese, Korean and Swedish pages in the original and found the source
    text carried the native forms throughout.

Measured hit rate, the only number worth trusting here: lane n ran it over 40 pages and found four
real misses. One of those was the error this tool exists for. Lane n had written "Alabama Ordnance
Works" on the Talladega page, the site's historical name, from memory rather than from any source.
It reads as exactly the kind of local detail that makes a page credible, and nothing else on this
project would ever have caught it.
"""
import io, json, os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.source-cache')
IDX = os.path.join(CACHE, '_index.json')

# Words that start a sentence or are ordinary English, so a capital letter means nothing.
STOP = set('''The A An In On At By For And But Or It That This These Those There Here What When
Where While Which Who Whom If As Of To From With Without After Before Since Until During Its His
Her Their They We You He She No Not So Then Now One Two Three Four Five Six Seven Eight Nine Ten
Most Both Each Every Whether Because Even Only Also Still Yet Both Neither Nor More Less Much Many
Several Some Any All Such Same Other Another Next Last First Second Third New Old Under Over About
Between Across Along Around Behind Beyond Through Against Toward Towards Upon Within Among Per
County City Town Village State Data Center Centre Project Company Group Board Council Commission
Court Department Agency Authority Office Committee Association Corporation Limited Inc Ltd LLC
January February March April May June July August September October November December Monday
Tuesday Wednesday Thursday Friday Saturday Sunday'''.split())

# Honorifics and ranks, stripped before matching because sources abbreviate what pages spell out.
TITLES = set('''state senator representative rep sen gov governor mayor councillor councilman
councilwoman commissioner supervisor delegate congressman congresswoman chairman chairwoman chair
brigadier general colonel captain sergeant judge justice dr doctor professor prof sir dame lord
lady premier minister secretary director president vice chief officer alderman trustee'''.split())

NAME = re.compile(r'\b[A-Z][a-zÀ-ɏ]+(?:[-’\' ][A-Z][a-zÀ-ɏ]+)*\b')
FIGURE = re.compile(r'\b\d[\d,\.]*\s*(?:MW|GW|megawatts?|gigawatts?|acres?|hectares?|million|billion)\b', re.I)


ONES = {'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
        '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten', '11': 'eleven',
        '12': 'twelve', '13': 'thirteen', '14': 'fourteen', '15': 'fifteen', '16': 'sixteen',
        '17': 'seventeen', '18': 'eighteen', '19': 'nineteen', '20': 'twenty', '30': 'thirty',
        '40': 'forty', '50': 'fifty', '60': 'sixty', '70': 'seventy', '80': 'eighty',
        '90': 'ninety', '100': 'hundred', '200': 'two hundred', '300': 'three hundred',
        '400': 'four hundred', '500': 'five hundred', '600': 'six hundred',
        '700': 'seven hundred', '800': 'eight hundred', '900': 'nine hundred',
        '1000': 'thousand'}


def spelled_out(fig, src):
    """Is this figure present in the source as words rather than digits?"""
    num = re.sub(r'[^0-9]', '', fig.split()[0])
    word = ONES.get(num.lstrip('0') or '0')
    if not word:
        return False
    tail = fig.split(None, 1)[1].lower() if len(fig.split()) > 1 else ''
    unit = re.sub(r'[^a-z]', '', tail)
    if unit and (word + ' ' + unit) in src:
        return True
    return (word + ' ') in src


def norm(s):
    """Fold case, accents and punctuation so 'Hydro-Quebec' matches 'Hydro-Québec'."""
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.replace('’', "'").replace('‘', "'")
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()


def reports(lane_filter=None):
    out = {}
    for f in sorted(os.listdir(os.path.join(ROOT, 'data'))):
        m = re.match(r'place-reports(?:-([a-z]))?\.json$', f)
        if not m:
            continue
        lane = m.group(1) or 'a'
        if lane_filter and lane != lane_filter:
            continue
        try:
            d = json.load(io.open(os.path.join(ROOT, 'data', f), encoding='utf-8'))
        except Exception:
            continue
        for u, r in d.items():
            if r.get('paragraphs'):
                cur = out.get(u)
                k = (len(r.get('sources') or []), sum(len(t.split()) for t in r['paragraphs']))
                if cur is None or k > cur[0]:
                    out[u] = (k, lane, r)
    return out


def urls_of(rep):
    """Lane g stores sources as {title, publisher, url} objects, everyone else as plain strings.
    Reported by lane g after this crashed with "unhashable type: dict"."""
    out = []
    for x in (rep.get('sources') or []):
        u = x.get('url') if isinstance(x, dict) else x
        if u:
            out.append(u)
    return out


# A source this short is a paywall stub, a cookie wall or a page whose body loads by script. It
# is recorded as readable because bytes came back, but it is not the article, and treating it as
# complete makes every name that lives in the real body look invented. Reported by lane b, whose
# BNamericas source cached at 1,518 characters and whose sustainablebiz one cached at 786.
PARTIAL_UNDER = 2000


def source_text(idx, urls):
    """Everything the page's own sources say, as one normalised blob, plus the ones that failed."""
    blob, failed = [], []
    for u in urls:
        info = idx.get(u)
        if not info:
            failed.append((u, 'not cached'))
            continue
        if info.get('failed'):
            failed.append((u, info.get('note') or 'would not open'))
            continue
        if info.get('chars', 0) < PARTIAL_UNDER:
            failed.append((u, 'only %d chars cached, probably a paywall or lazy-loaded body'
                           % info.get('chars', 0)))
            # still read what there is; it may contain the name

        try:
            blob.append(io.open(os.path.join(CACHE, info['file']), encoding='utf-8',
                                errors='replace').read())
        except Exception:
            failed.append((u, 'cache file missing'))
    return norm(' '.join(blob)), failed


def check(url, rep, idx):
    text = ' '.join(rep['paragraphs'])
    src, failed = source_text(idx, urls_of(rep))
    if not src:
        return None, failed

    # A single capitalised word that only ever appears at the start of a sentence is almost
    # always an ordinary word, not a name: Residents, Nobody, Separately, Estimates. Flagging
    # those buries the ones that matter, and a checker nobody reads is worse than none.
    sent_start = set()
    for m in re.finditer(r'(?:^|[.!?”]\s+)([A-Z][a-zÀ-ɏ]+)', text):
        sent_start.add(m.group(1))
    midtext = set()
    for m in re.finditer(r'(?<=[a-z,;:]\s)([A-Z][a-zÀ-ɏ]+)', text):
        midtext.add(m.group(1))

    bad_names, seen = [], set()
    for n in NAME.findall(text):
        if n in STOP or len(n) < 4 or n in seen:
            continue
        if ' ' not in n and n in sent_start and n not in midtext:
            continue          # only ever starts a sentence, so treat it as an ordinary word
        seen.add(n)
        # A multi-word name counts as present if the whole thing is there, or if every word is.
        nn = norm(n)
        if nn in src:
            continue
        # Sources abbreviate titles and pages spell them out: 'Sen. Gene Yaw' against 'State
        # Senator Gene Yaw', 'Brig. Gen.' against 'Brigadier General', 'Gov.' against 'Governor'.
        # Match on the name, not the honorific.
        words = nn.split()
        while words and words[0] in TITLES:
            words = words[1:]
        if words and ' '.join(words) in src:
            continue
        parts = [p for p in words if p not in ('the', 'of', 'and')]
        if parts and all(p in src for p in parts):
            continue
        bad_names.append(n)

    bad_figs = []
    src_digits = re.sub(r'[^0-9]', '', src)
    for f in set(FIGURE.findall(text)):
        digits = re.sub(r'[^0-9]', '', f.split()[0])
        if not digits or digits in src_digits:
            continue
        # Documents spell numbers out. Bartow's county policy PDF says 'eighteen billion dollars'
        # and 'three hundred' where the page says $18 billion and 300 megawatts.
        if spelled_out(f, src):
            continue
        bad_figs.append(f)
    return (bad_names, bad_figs), failed


def main():
    if not os.path.exists(IDX):
        sys.exit('no source cache. Run:  python tools/cache-sources.py')
    idx = json.load(io.open(IDX, encoding='utf-8'))

    lane = None
    one = None
    args = sys.argv[1:]
    for i, a in enumerate(args):
        if a == '--lane' and i + 1 < len(args):
            lane = args[i + 1]
        elif a.startswith('-'):
            continue
        elif a != lane:
            t = a.replace('\\', '/')
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

    D = reports(lane)
    if one:
        D = {k: v for k, v in D.items() if k.rstrip('/') == one.rstrip('/')}
        if not D:
            sys.exit('no page at %s' % one)

    pages = flagged = names = figs = 0
    nocache = []
    for u, (_, ln, rep) in sorted(D.items()):
        res, failed = check(u, rep, idx)
        if res is None:
            nocache.append(u)
            continue
        pages += 1
        bad_names, bad_figs = res
        if not bad_names and not bad_figs:
            continue
        flagged += 1
        names += len(bad_names)
        figs += len(bad_figs)
        print('%s  lane %s' % (u, ln))
        if bad_names:
            print('   NAME NOT IN SOURCES:   %s' % ', '.join(sorted(bad_names)))
        if bad_figs:
            print('   FIGURE NOT IN SOURCES: %s' % ', '.join(sorted(bad_figs)))
        if failed:
            print('   (could not read %d of its sources, so this may be a false alarm)' % len(failed))
        print('')

    print('%d pages checked, %d carry something not found in their own sources '
          '(%d names, %d figures).' % (pages, flagged, names, figs))
    if nocache:
        print('%d pages had no readable cached source and were skipped.' % len(nocache))
    print('Read the flags before acting on any of them. A source that would not fetch makes every '
          'name in it look invented.')


if __name__ == '__main__':
    main()
