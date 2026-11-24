# -*- coding: utf-8 -*-
"""Show a page's PROSE next to the DATA the same page displays, so the seam can be read.

Travis County shipped with "6 projects mapped" in the headline over "Austin has no large-scale AI
data center yet" in the lead. Nobody caught it in 960 reviews because the review read paragraphs
out of the JSON. The headline, the stat line, the letter block and the project table are all
generated from the project records at build time, so a reviewer reading prose never saw any of
them. The page contradicts itself only when you look at the whole thing.

That is a hole in the method, not a bad page. This prints both halves together so a person can
read across the seam and judge:

    HEADLINE / STAT LINE / LETTER LINE   <- generated from the records
    THE PROJECT TABLE                    <- generated from the records
    THE REPORT                           <- written by a lane

No flagging, no scoring, no regex verdict. The point is to put the two things on one screen,
which is the thing that never happened.
"""
import glob, io, os, random, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render import text, wrap  # noqa: E402


def show(path):
    f = os.path.join(path.strip('/').replace('/', os.sep), 'index.html')
    if not os.path.exists(f):
        print('MISSING %s' % f)
        return
    s = io.open(f, encoding='utf-8', errors='replace').read()
    print('\n' + '=' * 100)
    print('/' + path.strip('/') + '/')
    print('=' * 100)

    h1 = re.search(r'<h1>(.*?)</h1>', s, re.S)
    print('\nHEADLINE   %s' % (text(h1.group(1)) if h1 else '?'))

    m = re.search(r'<div class="w-stats">(.*?)</div>\s*</div>', s, re.S)
    if m:
        parts = [text(x) for x in re.findall(r'<div class="w-stat">(.*?)</div>', m.group(1), re.S)]
        print('STATS      %s' % '  |  '.join(parts))

    let = re.search(r'<aside class="g-letter".*?<p>(.*?)</p>', s, re.S)
    if let:
        print('LETTER     %s' % text(let.group(1)))

    # the table the page actually shows
    rows = re.findall(r'<tr>(.*?)</tr>', s, re.S)
    printed = 0
    print('\nPROJECT TABLE AS DISPLAYED')
    for r in rows:
        cells = [text(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.S)]
        cells = [c for c in cells if c]
        if len(cells) >= 2 and 'Project' not in cells[0]:
            print('   ' + ' | '.join(cells[:5]))
            printed += 1
        if printed > 14:
            print('   ...')
            break
    if not printed:
        print('   (no table rows)')

    print('\nTHE REPORT AS WRITTEN')
    for p in re.findall(r'<p class="g-body"[^>]*>(.*?)</p>', s, re.S):
        print(wrap(text(p), 98, '   '))
        print()


args = [a for a in sys.argv[1:]]
if args and args[0] == '--sample':
    n = int(args[1]) if len(args) > 1 else 10
    seed = int(args[args.index('--seed') + 1]) if '--seed' in args else None
    pages = [p[:-len('index.html')].replace(os.sep, '/').rstrip('/')
             for p in glob.glob('data-centers/**/index.html', recursive=True)]
    random.seed(seed)
    args = random.sample(sorted(pages), n)
    print('SEAM READ: %d random pages%s' % (n, '  (seed %s)' % seed if seed else ''))
for a in args:
    show(a)
