// Removes project records that turned out not to exist, with their write-ups. The next build
// redirects their old pages to the place page above them.
// Usage: node tools/remove-records.js <id> [<id> ...]
const fs = require("fs");
const path = require("path");
const R = f => path.join(__dirname, "..", "data", f);
const ids = process.argv.slice(2);
const P = JSON.parse(fs.readFileSync(R("projects.json"), "utf8"));
const D = JSON.parse(fs.readFileSync(R("descriptions.json"), "utf8"));
const log = [];
for (const id of ids) {
  const i = P.projects.findIndex(p => p.id === id);
  if (i < 0) { log.push(`SKIP ${id}: not found`); continue; }
  log.push(`REMOVED ${id} (${P.projects[i].name})`);
  P.projects.splice(i, 1);
  delete D[id];
}
function save(f, obj) {
  for (let i = 0; ; i++) {
    try { fs.writeFileSync(R(f), JSON.stringify(obj, null, 1)); return; }
    catch (err) { if (i > 20) throw err; const t = Date.now() + 300; while (Date.now() < t); }
  }
}
save("projects.json", P); save("descriptions.json", D);
fs.appendFileSync(path.join(__dirname, "..", "data", "projects-run", "applied.md"),
  "\n## remove-records " + new Date().toISOString() + " (see final/verify-3-results.md)\n" + log.map(l => "- " + l).join("\n") + "\n");
console.log(log.join("\n"));
