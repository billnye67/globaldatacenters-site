"""Coordinator: merge only the projects a lane has finished (those with an entry in its fix file, which a lane
writes when a project is done), never a draft still being written. Append ! to a letter once that lane has reported its whole list finished.
    python tools/merge-finished.py g [h ...]"""
import json, sys, os, subprocess, tempfile, shutil
HOLD = set(json.load(open('data/projects-run/hold.json', encoding='utf-8'))) if os.path.exists('data/projects-run/hold.json') else set()  # records held back for James (e.g. not a data center)
d = os.path.join(tempfile.gettempdir(), 'merge-finished'); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
for L in sys.argv[1:]:
    whole = L.endswith('!'); L = L.rstrip('!')  # 'd!' = the lane reported every entry finished
    st = json.load(open(f'data/projects-run/story-{L}.json', encoding='utf-8'))
    fx = json.load(open(f'data/projects-run/fix-{L}.json', encoding='utf-8')) if os.path.exists(f'data/projects-run/fix-{L}.json') else {}
    done = [s for s in st if (whole or s.get('id') in fx) and s.get('id') not in HOLD]
    print(f'lane {L}: {len(done)} finished of {len(st)} in story file; held back: {[s["id"] for s in st if s.get("id") not in fx]}')
    json.dump(done, open(os.path.join(d, f'story-{L}.json'), 'w', encoding='utf-8'))
print(subprocess.run(['node', 'data/merge-reports.js', d], capture_output=True, text=True).stdout.split('length of each page')[0][-200:])
