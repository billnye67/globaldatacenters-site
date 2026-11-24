# -*- coding: utf-8 -*-
"""Dump a built page as a READER meets it, so it can be read rather than pattern-matched.

The review read `paragraphs` out of the JSON. That is not the page. The headline, the stat line,
the section order and the letter block are all generated at build time, so a reviewer reading
prose never saw them. Travis County shipped with "6 projects mapped" over "Austin has no
large-scale AI data center yet" and fourteen reviewers missed it, because none of them was ever
shown those two lines together.

So this prints the rendered page in reading order, top to bottom, exactly as it appears. No
filtering, no highlighting, nothing chosen for me in advance. The point is to look at it.

    python render.py <url-path> [more paths...]
    python render.py --sample 12 [--seed 7]
"""
import glob, io, os, random, re, sys


def text(h):
    h = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', h)
    h = re.sub(r'(?i)<br\s*/?>', '\n', h)
    # Inline tags vanish with no space, or 'Wales</a>.' renders as 'Wales .' and looks like
    # a typo on the page when the page is fine. Block tags become a space.
    h = re.sub(r'(?i)</?(a|b|i|em|strong|span|abbr|small|sup|sub|code)[^>]*>', '', h)
    h = re.sub(r'<[^>]+>', ' ', h)
    for a, b in (('&nbsp;', ' '), ('&amp;', '&'), ('&quot;', '"'), ('&#39;', "'"),
                 ('&lt;', '<'), ('&gt;', '>'), ('&mdash;', '—'), ('&ndash;', '–'),
                 ('&hellip;', '…'), ('&rsquo;', '’'), ('&lsquo;', '‘'),
                 ('&ldquo;', '“'), ('&rdquo;', '”')):
        h = h.replace(a, b)
    h = re.sub(r'&#(\d+);', lambda m: chr(int(m.group(1))), h)
    return re.sub(r'[ \t ]+', ' ', h).strip()


def wrap(s, w=96, indent=''):
    out, line = [], indent
    for word in s.split():
        if len(line) + len(word) + 1 > w:
            out.append(line.rstrip())
            line = indent + word + ' '
        else:
            line += word + ' '
    if line.strip():
        out.append(line.rstrip())
    return '\n'.join(out)


def render(path):
    f = path.strip('/').replace('/', os.sep)
    f = os.path.join(f, 'index.html') if not f.endswith('.html') else f
    if not os.path.exists(f):
        print('MISSING %s' % f)
        return
    s = io.open(f, encoding='utf-8', errors='replace').read()
    print('\n' + '=' * 98)
    print('/' + path.strip('/') + '/')
    print('=' * 98)

    def grab(pat, label, flags=re.S):
        m = re.search(pat, s, flags)
        if m:
            t = text(m.group(1))
            if t:
                print('\n[%s]' % label)
                print(wrap(t, 96, '  '))
        return m

    grab(r'<p class="g-crumb">(.*?)</p>', 'breadcrumb')
    grab(r'<div class="w-kicker">(.*?)</div>', 'kicker')
    grab(r'<h1>(.*?)</h1>', 'HEADLINE')
    m = re.search(r'<div class="w-stats">(.*?)</div>\s*</div>', s, re.S)
    if m:
        parts = [text(x) for x in re.findall(r'<div class="w-stat">(.*?)</div>', m.group(1), re.S)]
        if parts:
            print('\n[stat line]')
            print(wrap(' · '.join(parts), 96, '  '))
    cap = re.search(r'<figcaption class="g-mapfoot">(.*?)</figcaption>', s, re.S)
    if cap:
        print('\n[map caption]  %s' % text(cap.group(1)))

    print('\n[REPORT]')
    for i, p in enumerate(re.findall(r'<p class="g-body"[^>]*>(.*?)</p>', s, re.S)):
        print(wrap(text(p), 96, '  '))
        print()

    let = re.search(r'<aside class="g-letter".*?<h2[^>]*>(.*?)</h2>(.*?)</aside>', s, re.S)
    if let:
        body = text(let.group(2))
        print('[letter block]  %s' % text(let.group(1)))
        print(wrap(body, 96, '  '))

    acts = re.findall(r'<a class="g-btn[^"]*"[^>]*>(.*?)</a>', s, re.S)
    if acts:
        print('\n[buttons]  ' + '   |   '.join(text(a) for a in acts))

    print('\n[sections, in order]')
    for h, lede in re.findall(r'<section class="g-sec"[^>]*>\s*<h2[^>]*>(.*?)</h2>'
                              r'(?:\s*<p class="g-lede">(.*?)</p>)?', s, re.S):
        print('  - %s%s' % (text(h), ('  (%s)' % text(lede)) if lede else ''))
    sl = re.search(r'<ul class="g-srcs">(.*?)</ul>', s, re.S)
    srcs = re.findall(r'href="([^"]+)"', sl.group(1)) if sl else []
    if srcs:
        print('\n[sources]  %d: %s' % (len(srcs), ', '.join(
            re.sub(r'^https?://(www\.)?', '', u).split('/')[0] for u in srcs[:10])))

def main(args):
    """Guarded so that importing this module for its text()/wrap() helpers does not also run it.
    Without the guard, importing render from seam.py re-ran this block, consumed seam.py's own
    command line and printed the wrong view entirely."""
    if args and args[0] == '--sample':
        n = int(args[1]) if len(args) > 1 else 12
        seed = int(args[args.index('--seed') + 1]) if '--seed' in args else None
        pages = [q[:-len('index.html')].replace(os.sep, '/')
                 for q in glob.glob('data-centers/**/index.html', recursive=True)]
        pages += [q[:-len('index.html')].replace(os.sep, '/')
                  for q in glob.glob('company/*/index.html')]
        random.seed(seed)
        args = random.sample(sorted(pages), n)
        print('RANDOM SAMPLE OF %d RENDERED PAGES%s' % (n, '  (seed %s)' % seed if seed else ''))
    for a in args:
        render(a)


if __name__ == '__main__':
    main(sys.argv[1:])
