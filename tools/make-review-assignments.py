# -*- coding: utf-8 -*-
"""Split every written page across reviewers, so that nobody reviews their own work.

    python tools/make-review-assignments.py            # writes data/review/review-<letter>.md

A lane grading the pages it wrote will pass them. The whole value of the review is that a second
person, who has no stake in the page and did not do the searching, asks whether it is any good.
So the only hard rule here is that reviewer != author.

Assignment is deterministic: pages are ordered by url and dealt round-robin to the reviewer list,
skipping any reviewer who wrote the page. Running it twice gives the same answer, so a reviewer
can re-generate its own list without asking anyone.
"""
import io, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'review')

# The terminals available to review, by the lane letter each is running as.
# Only the terminals actually running. Assigning to a dead lane loses its batch silently,
# which is worse than giving the live ones more to read.
REVIEWERS = ['a','h','i','j','k','l','n','o','p','q','r','s','t','v']


def show(p):
    return subprocess.run(['git', 'show', 'origin/preview:' + p],
                          capture_output=True).stdout.decode('utf-8')


def load():
    """Every written page, with the lane that owns the version the build publishes."""
    listing = subprocess.run(['git', 'ls-tree', '--name-only', 'origin/preview', 'data/'],
                             capture_output=True, text=True).stdout.split()
    best = {}
    for f in listing:
        m = re.match(r'data/place-reports(?:-([a-z]))?\.json$', f)
        if not m:
            continue
        lane = m.group(1) or 'a'
        try:
            d = json.loads(show(f))
        except Exception:
            continue
        for u, r in d.items():
            paras = r.get('paragraphs') or []
            if not paras:
                continue
            depth = (len(r.get('sources') or []),
                     sum(len(t.split()) for t in paras))
            if u not in best or depth > best[u][0]:
                best[u] = (depth, lane, r)
    return best


def main():
    pages = load()
    active = [r for r in REVIEWERS]
    # who wrote what, so a reviewer never gets its own page
    rows = sorted((u, v[1], v[0][1], v[0][0]) for u, v in pages.items())

    assign = {r: [] for r in active}
    i = 0
    for url, author, words, nsrc in rows:
        for _ in range(len(active)):
            cand = active[i % len(active)]
            i += 1
            if cand != author:
                assign[cand].append((url, author, words, nsrc))
                break

    os.makedirs(OUT, exist_ok=True)
    total = 0
    for r in active:
        mine = assign[r]
        total += len(mine)
        lines = []
        lines.append('# Review list for lane %s' % r)
        lines.append('')
        lines.append('%d pages. **None of them are yours.** That is the point: a lane grading its '
                     'own work passes it.' % len(mine))
        lines.append('')
        lines.append('Read `data/REVIEW.md` first. It has the four questions and what the verdicts '
                     'mean.')
        lines.append('')
        lines.append('Record your verdict against each line here, in this file, and push it with')
        lines.append('`bash tools/safe-push.sh "review: lane %s batch" data/review/review-%s.md`.'
                     % (r, r))
        lines.append('')
        lines.append('| Page | Written by | Words | Sources | Verdict | Note |')
        lines.append('|---|---|---|---|---|---|')
        for url, author, words, nsrc in mine:
            lines.append('| `%s` | %s | %d | %d |  |  |' % (url, author, words, nsrc))
        lines.append('')
        io.open(os.path.join(OUT, 'review-%s.md' % r), 'w', encoding='utf-8').write('\n'.join(lines))

    print('%d pages split across %d reviewers, average %d each'
          % (total, len(active), total // max(len(active), 1)))
    for r in active:
        print('   lane %s: %3d pages' % (r, len(assign[r])))


if __name__ == '__main__':
    main()
