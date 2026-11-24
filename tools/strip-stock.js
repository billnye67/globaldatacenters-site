// Removes the banned "The latest reporting is from ..." lines from data/descriptions.json
// (text, paragraphs and sentences), keeping any real fact in the same sentence.
// Usage: node tools/strip-stock.js [--dry]
const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "data", "descriptions.json");
const dry = process.argv.includes("--dry");
const d = JSON.parse(fs.readFileSync(FILE, "utf8"));

// exact rewrites for sentences that carry a fact alongside the stock phrase
const EXACT = [
  ["The latest reporting on the site is the Guardian's May 2026 report.", ""],
  ["The latest reporting is from September 2026, when the Chamber panel heard", "In September 2026, a Chamber panel heard"],
  ["The Fort Worth City Council decides the rezoning, and the latest reporting on the project, from September 2026, says the city's moratorium will not reach it.", "The Fort Worth City Council decides the rezoning; reporting in September 2026 said the city's moratorium will not reach it."],
  ["The latest reporting on the Paris Digital Park itself is from May 2023; the latest on Digital Realty in Paris is from May 2026.", ""],
  ["No new application or appeal has been reported since the July 2026 vote, the latest reporting on the site.", "No new application or appeal has been filed since the July 2026 vote."],
  ["no application has been filed as of the latest reporting in July 2026.", "no application had been filed as of July 2026."],
  ["The latest reporting on Sentinel Grove itself dates from February 2026, when DCD reported that the applicant", "In February 2026, DCD reported that the Sentinel Grove applicant"],
  ["The latest reporting, from August 2026, describes the campus as under construction.", "As of August 2026, the campus was under construction."],
  ["It has not been reported whether construction has begun on the Southeast Property Holdings campus; the latest reporting on Hampton's data centers is from August 2026.", ""],
  ["The latest reporting that mentions the project is from April 2026.", ""],
  ["as of the latest reporting in July 2026 it remained a solicitation with no developer chosen.", "as of July 2026 it remained a solicitation with no developer chosen."],
  ["The latest reporting on the La Vista building is DCD's January 2025 story.", ""],
  ["The latest reporting on Reno's data center rules is from June 2026, and Centra's own site gives the fourth-quarter 2026 date.", "Centra's own site gives a fourth-quarter 2026 date."],
  ["The latest reporting that names the Newcastle Road site is the News 9 roundup from June 2026, which describes ValorC3 as operating it.", "A News 9 roundup in June 2026 described ValorC3 as operating the Newcastle Road site."],
  ["The latest reporting is from the summer of 2026.", ""],
  ["Catalyst could not be reached for comment in January 2026, the latest reporting on the site.", "Catalyst could not be reached for comment in January 2026."],
  ["The latest reporting on the Fourth Avenue carrier hotel itself is DCD's February 2026 story.", ""],
  ["The latest reporting on the Georgetown site is the company's January 2026 update, which still targeted power delivery in 2026.", "The company's January 2026 update still targeted power delivery in 2026."],
  ["That is the latest reporting, from September 17, 2026.", ""],
  ["the latest reporting on it, from July 2025, counts it as one of the county's two approved data centers, and any further approvals rest with Caroline County.", "July 2025 reporting counted it as one of the county's two approved data centers, and any further approvals rest with Caroline County."],
  ["; the latest reporting is from the council's July 2026 meeting.", "."],
  ["The latest reporting on the Franklin Township site is from the fall of 2025, and on the county's approval process from February 2026.", ""],
  ["; the latest reporting is from AWS's August 18, 2026 announcement.", "."],
  ["The latest reporting on the Aligned campus itself is from the April 2025 groundbreaking.", ""],
  ["The latest reporting is from the May 28, 2026 meeting.", ""],
  ["; the latest reporting is a resident's column from August 2026.", "."],
];
// generic: a whole stock sentence, or a trailing stock clause
const PURE = /\s*"?\s*The latest reporting( on [^.;,]{1,80})? (is|dates) from (early |late |mid-)?[A-Za-z]+( \d{1,2})?,? ?(\d{4})?\.(?=\s|$)/g;
const CLAUSE = /[,;] (and )?the latest reporting( on [^.;,]{1,80})? is from (early |late |mid-)?[A-Za-z]+( \d{1,2})?,? ?(\d{4})?\./g;

function clean(s) {
  let t = s;
  for (const [a, b] of EXACT) t = t.split(a).join(b);
  t = t.replace(CLAUSE, ".").replace(PURE, "");
  return t.replace(/\s{2,}/g, " ").replace(/\s+$/, "").replace(/^\s+/, "");
}

let changed = 0;
const left = [];
for (const id in d) {
  const e = d[id];
  const before = JSON.stringify(e);
  if (typeof e.text === "string") e.text = clean(e.text);
  if (Array.isArray(e.paragraphs)) e.paragraphs = e.paragraphs.map(p => typeof p === "string" ? clean(p) : p).filter(p => p !== "");
  if (Array.isArray(e.sentences)) e.sentences = e.sentences.map(x => x && typeof x.t === "string" ? Object.assign(x, { t: clean(x.t) }) : x).filter(x => !(x && x.t === ""));
  if (JSON.stringify(e) !== before) {
    changed++;
    if (typeof e.text === "string") e.words = e.text.split(/\s+/).filter(Boolean).length;
  }
  if (/latest reporting/i.test(JSON.stringify(e))) left.push(id);
}
console.log("changed", changed, "still has phrase", left.length, left.join(" "));
if (!dry) {
  for (let i = 0; ; i++) {
    try { fs.writeFileSync(FILE, JSON.stringify(d, null, 1)); break; }
    catch (err) { if (i > 20) throw err; const t = Date.now() + 300; while (Date.now() < t); }
  }
}
