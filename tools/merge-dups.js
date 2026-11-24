// Merges duplicate project records. Plan file: [{ "keep": id, "drop": id, "name": optional new name, "why": "..." }]
// The kept record gets the dropped one's sources, any fields it lacks, and its blocked/decision info;
// the dropped record and its write-up are removed and its page redirects to the kept page.
// Usage: node tools/merge-dups.js <plan.json> [--dry]
const fs = require("fs");
const path = require("path");
const R = f => path.join(__dirname, "..", "data", f);
const dry = process.argv.includes("--dry");
const plan = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const P = JSON.parse(fs.readFileSync(R("projects.json"), "utf8"));
const D = JSON.parse(fs.readFileSync(R("descriptions.json"), "utf8"));
const PAGES = JSON.parse(fs.readFileSync(R("project-pages.json"), "utf8"));
const MOVED = JSON.parse(fs.readFileSync(R("moved-urls.json"), "utf8"));
const FILL = ["developer", "tenant", "address", "lat", "lng", "town_lat", "town_lng", "capacity_mw", "year_announced", "year_operating_or_planned"];
const log = [];

for (const e of plan) {
  if (e.rename) {
    const r = P.projects.find(p => p.id === e.rename);
    if (!r) { log.push(`SKIP rename ${e.rename}: id not found`); continue; }
    log.push(`RENAMED ${e.rename}: ${JSON.stringify(r.name)} -> ${JSON.stringify(e.name)}\n  why: ${e.why || ""}`);
    r.name = e.name; continue;
  }
  const k = P.projects.find(p => p.id === e.keep);
  const di = P.projects.findIndex(p => p.id === e.drop);
  if (!k || di < 0) { log.push(`SKIP ${e.keep} <- ${e.drop}: id not found`); continue; }
  const d = P.projects[di];
  const parts = [];
  const add = (d.sources || []).filter(u => !(k.sources || []).includes(u));
  if (add.length) { k.sources = (k.sources || []).concat(add); parts.push(`+${add.length} sources`); }
  for (const f of FILL) if ((k[f] == null || k[f] === "") && d[f] != null && d[f] !== "") { k[f] = d[f]; parts.push(`${f} from dropped`); }
  if (!k.blocked && d.blocked) { k.blocked = d.blocked; parts.push("blocked info from dropped"); }
  if (e.name) { parts.push(`name ${JSON.stringify(k.name)} -> ${JSON.stringify(e.name)}`); k.name = e.name; }
  if (!D[k.id] && D[d.id]) { D[k.id] = Object.assign({}, D[d.id], { id: k.id }); parts.push("write-up moved from dropped"); }
  delete D[d.id];
  P.projects.splice(di, 1);
  const from = PAGES[d.id], to = PAGES[k.id];
  if (from && to && from !== to) { MOVED[from] = to; parts.push(`redirect ${from} -> ${to}`); }
  log.push(`MERGED ${d.id} (${d.name}) into ${k.id} (${k.name}): ${parts.join("; ")}\n  why: ${e.why || ""}`);
}

function save(f, obj, indent) {
  for (let i = 0; ; i++) {
    try { fs.writeFileSync(R(f), JSON.stringify(obj, null, indent)); return; }
    catch (err) { if (i > 20) throw err; const t = Date.now() + 300; while (Date.now() < t); }
  }
}
console.log(log.join("\n"));
if (!dry) {
  save("projects.json", P, 1); save("descriptions.json", D, 1); save("moved-urls.json", MOVED, 1);
  fs.appendFileSync(path.join(__dirname, "..", "data", "projects-run", "applied.md"), "\n## merge-dups " + new Date().toISOString() + "\n" + log.map(l => "- " + l).join("\n") + "\n");
}
