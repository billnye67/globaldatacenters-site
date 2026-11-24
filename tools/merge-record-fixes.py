# -*- coding: utf-8 -*-
"""Merge the twelve lanes' record corrections into data/projects.json.

    python tools/merge-record-fixes.py            # dry run: report only, change nothing
    python tools/merge-record-fixes.py --apply    # write projects.json

Twelve sessions each read about 184 records against the article printed beside them and wrote
corrections into their own data/records/fix-<letter>.json. Each correction carries a `why`
quoting the article or the record's own source. This is the only place those files are applied,
by one writer, because twelve sessions editing one file is how twenty pages got reverted
yesterday.

What it refuses to do, and why each guard exists:

  - It will not apply a correction with no `why`. The whole point of this pass is that every
    change is checkable by a person afterwards.
  - It will not invent a status. Anything outside the vocabulary the site already renders is
    rejected, because a status the builder does not understand prints as raw text on the page,
    which is how '830 acres' ended up displayed as a project's stage.
  - It will not apply a correction to an id that does not exist.
  - When two lanes correct the same record it reports the clash rather than silently letting the
    alphabetically-last file win.

`drop: true` removes a record that is not a data centre project at all: a moratorium, a land
bank, an FCC licensing decision, a cannabis building advertising '1MW available'.
`duplicate_of: <id>` removes a record that is the same campus as another, keeping the named one.
"""
import glob, io, json, os, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'data', 'projects.json')

# The statuses the builder knows how to render. Anything else reaches the page as raw text.
# Taken from STATUS_BUCKET in data/build-pages.js, which is what the site can actually render,
# NOT from the statuses that happen to be in the data today. I built this list the wrong way the
# first time and it rejected 'withdrawn' on 27 records, a status the builder has always handled.
STATUS = {'operating', 'operating (expanding)',
          'under construction', 'proposed', 'proposed (early)', 'approved',
          'blocked', 'cancelled', 'withdrawn', 'suspended', 'on hold', 'paused', 'moratorium',
          'unknown'}
EDITABLE = {'name', 'developer', 'tenant', 'status', 'capacity_mw', 'address', 'sources',
            'note', 'country', 'program', 'year_announced', 'county', 'region'}


def main():
    apply = '--apply' in sys.argv
    doc = json.load(io.open(P, encoding='utf-8'))
    by_id = {r['id']: r for r in doc['projects']}

    fixes, owner, clash = {}, {}, collections.defaultdict(list)
    for f in sorted(glob.glob(os.path.join(ROOT, 'data', 'records', 'fix-*.json'))):
        lane = os.path.basename(f).split('fix-')[1][0]
        try:
            d = json.load(io.open(f, encoding='utf-8'))
        except Exception as e:
            print('UNREADABLE %s: %s' % (f, e))
            continue
        for rid, v in d.items():
            clash[rid].append(lane)
            prev = fixes.get(rid)
            if prev is None:
                fixes[rid], owner[rid] = v, lane
                continue
            # Two lanes reached the same record. A verdict that the record should not exist beats
            # a correction to its fields: Port Washington had three rows for one campus, and one
            # lane tidied a row while another recognised it as the duplicate. Tidying the fields
            # of a row that is about to be removed is wasted, and keeping it would leave the
            # campus counted twice.
            strong = lambda x: bool(x.get('drop') or x.get('duplicate_of'))
            if strong(v) and not strong(prev):
                fixes[rid], owner[rid] = v, lane

    applied = collections.Counter()
    dropped, merged, rejected = [], [], []

    for rid, v in fixes.items():
        if not isinstance(v, dict):
            rejected.append((rid, 'not an object')); continue
        if not str(v.get('why', '')).strip():
            rejected.append((rid, 'no why')); continue
        rec = by_id.get(rid)
        if rec is None:
            rejected.append((rid, 'id not in projects.json')); continue
        if v.get('drop'):
            dropped.append((rid, rec.get('name'), v['why'])); continue
        if v.get('duplicate_of'):
            if v['duplicate_of'] not in by_id:
                rejected.append((rid, 'duplicate_of points at a missing id')); continue
            merged.append((rid, rec.get('name'), v['duplicate_of'])); continue
        for k, val in v.items():
            if k in ('why', 'drop', 'duplicate_of'):
                continue
            if k not in EDITABLE:
                rejected.append((rid, 'field not editable: ' + k)); continue
            if k == 'status':
                if str(val).strip().lower() not in STATUS:
                    rejected.append((rid, 'status not in vocabulary: %r' % val)); continue
                val = str(val).strip().lower()
            if k == 'capacity_mw' and val is not None:
                try:
                    val = float(val)
                    val = int(val) if val == int(val) else val
                except Exception:
                    rejected.append((rid, 'capacity not a number: %r' % val)); continue
            if apply:
                rec[k] = val
            applied[k] += 1

    real_clash = {k: v for k, v in clash.items() if len(v) > 1}

    print('lanes delivered        : %d' % len(glob.glob(os.path.join(ROOT, 'data', 'records', 'fix-*.json'))))
    print('corrections read       : %d' % len(fixes))
    print('fields changed         : %s' % dict(applied))
    print('records dropped        : %d' % len(dropped))
    print('records merged as dupes: %d' % len(merged))
    print('rejected               : %d' % len(rejected))
    print('same record, two lanes : %d' % len(real_clash))
    for rid, why in rejected[:12]:
        print('   REJECT %-46s %s' % (rid[:46], why))
    for rid, lanes in list(real_clash.items())[:8]:
        print('   CLASH  %-46s lanes %s' % (rid[:46], ','.join(lanes)))

    if apply:
        keep, removed = [], {r for r, _, _ in dropped} | {r for r, _, _ in merged}
        for r in doc['projects']:
            if r['id'] not in removed:
                keep.append(r)
        doc['projects'] = keep
        io.open(P, 'w', encoding='utf-8').write(json.dumps(doc, ensure_ascii=False, indent=1))
        print('\nwrote projects.json: %d records, %d removed' % (len(keep), len(removed)))
    else:
        print('\nDRY RUN. Nothing written. Pass --apply to write.')


main()
