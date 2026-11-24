// Coordinator edits to one project record, e.g. node tools/set-field.js <id> <field> <json value|DELETE>
// Retries the write because agents reading projects.json can lock it briefly on Windows.
const fs = require('fs');
const [id, field, raw] = process.argv.slice(2);
const P = JSON.parse(fs.readFileSync('data/projects.json', 'utf8'));
const p = P.projects.find(x => x.id === id);
if (!p) { console.error('no record ' + id); process.exit(1); }
const before = p[field];
if (raw === 'DELETE') delete p[field]; else p[field] = JSON.parse(raw);
for (let i = 0; ; i++) {
  try { fs.writeFileSync('data/projects.json', JSON.stringify(P, null, 1)); break; }
  catch (e) { if (i > 20) throw e; const t = Date.now() + 500; while (Date.now() < t); }
}
console.log(id, field, JSON.stringify(before), '->', raw);
