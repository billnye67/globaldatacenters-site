import json,sys
L=sys.argv[1]; n=int(sys.argv[2])
R=json.load(open('data/projects-run/wave2-rest.json',encoding='utf-8'))
try: A=json.load(open('data/projects-run/wave2-assigned.json',encoding='utf-8'))
except FileNotFoundError: A={}
taken={i for v in A.values() for i in v}
todo=[i for i in R if i not in taken][:n]
P={p['id']:p for p in json.load(open('data/projects.json',encoding='utf-8'))['projects']}
pg=json.load(open('data/project-pages.json',encoding='utf-8'))
out=[f'# Wave 2 list {L.upper()}\n',f'{len(todo)} projects, most important first. Brief: `data/projects-run/PROJECT-LANE.md` (read all of it again). Your files: `data/projects-run/story-{L}.json`, `fix-{L}.json`, `progress-{L}.md`. Work top to bottom. When you reach the 200-search cap, stop and report how far you got.\n','Open each page at `http://localhost:8787` + the path below and read it first.\n']
for i in todo:
    p=P[i]
    out.append(f"## {p['name']}\n\n- id: `{i}`\n- page: `{pg.get(i,'(no page yet)')}`\n- record now: status **{p.get('status')}**, capacity_mw **{p.get('capacity_mw')}**, developer **{p.get('developer')}**, address **{p.get('address')}**, country **{p.get('country')}**, lat/lng {p.get('lat')}, {p.get('lng')}\n- sources on the record:")
    out+= [f'  - {s}' for s in (p.get('sources') or []) if str(s).startswith('http')] or ['  - (none)']
    out.append('')
open(f'data/projects-run/wave2-{L}.md','w',encoding='utf-8',newline='\n').write('\n'.join(out))
A[L]=todo; json.dump(A,open('data/projects-run/wave2-assigned.json','w',encoding='utf-8'),indent=1)
print(L,len(todo),'assigned;',len(R)-len(taken)-len(todo),'left in queue')
