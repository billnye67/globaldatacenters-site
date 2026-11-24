// node data/apply-addresses.js data/address-batch-01.csv
const fs=require('fs');
const f='data/projects.json', d=JSON.parse(fs.readFileSync(f));
const csv=fs.readFileSync(process.argv[2],'utf8').trim().split('\n').slice(1);
let n=0, miss=[];
for(const line of csv){const [id,addr]=line.split(';');const p=d.projects.find(x=>x.id===id);
  if(!p){miss.push(id);continue;} p.address=addr; p.lat=null; p.lng=null; p.geocode='pending'; n++;}
let fixed=0; for(const p of d.projects){ if(!p.geocode && p.address && p.kind!=='jurisdiction'){p.geocode='pending';fixed++;} }
fs.writeFileSync(f,JSON.stringify(d,null,1));
console.log('updated',n,'rows; missing ids:',miss.length?miss.join(', '):'none','; re-queued',fixed,'blank rows');
