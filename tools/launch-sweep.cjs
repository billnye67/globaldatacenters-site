/* Read-only review of published HTML. Writes findings only to .source-cache. */
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..'), outDir = path.join(root, '.source-cache/launch-sweep-20260927');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const decode = s => s.replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : +n)).replace(/&(?:nbsp|amp|quot|apos|lt|gt|mdash|ndash|rsquo|lsquo|rdquo|ldquo);/g, s => ({'&nbsp;':' ','&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>','&mdash;':'—','&ndash;':'–','&rsquo;':"'",'&lsquo;':"'",'&rdquo;':'"','&ldquo;':'"'}[s]));
const text = s => decode(s.replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim();
function fileFor(u) { let p = path.join(root, decodeURIComponent(u.split(/[?#]/)[0])); for (const f of [p, p+'.html', path.join(p, 'index.html')]) if(fs.existsSync(f)&&fs.statSync(f).isFile()) return f; }
const urls = new Set(JSON.parse(read('data/page-urls.json')));
for(const m of read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)) { const u = new URL(decode(m[1])); urls.add(u.pathname); }
for(const f of fs.readdirSync(root)) if(f.endsWith('.html')) urls.add(f==='index.html'?'/':'/'+f.replace(/\.html$/,''));
const pages=[], paragraphs=new Map(), invalidJson=[], missing=[];
const research = /(?:sources? (?:opened|reviewed|checked|available)|opened (?:sources?|material)|(?:could|can) not (?:establish|verify|confirm|find)|couldn.t (?:establish|verify|confirm|find)|latest (?:reporting|source)|(?:the|our) record (?:does not|doesn't|says|lists)|in (?:this|our) dataset|search results?|source set|reporting (?:reviewed|available)|no (?:opened|accessible) source)/gi;
for(const u of urls) {
  const f=fileFor(u); if(!f){missing.push(u);continue;} const html=fs.readFileSync(f,'utf8');
  const main=/<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1]||html.replace(/<header\b[\s\S]*?<\/header>|<footer\b[\s\S]*?<\/footer>/gi,'');
  const ps=[...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(m=>text(m[1])).filter(p=>p.split(/\s+/).length>25&&!/^Every project above is drawn|letter from a resident|letters sent so far/i.test(p));
  const body=text(main), title=text(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]||''), h1=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>text(m[1]));
  const flags=[...body.matchAll(research)].map(m=>body.slice(Math.max(0,m.index-80),m.index+190));
  const row={url:u,file:path.relative(root,f).split(path.sep).join('/'),title,h1,reportWords:ps.join(' ').split(/\s+/).filter(Boolean).length,paragraphs:ps.length,maxParagraph:Math.max(0,...ps.map(p=>p.split(/\s+/).length)),researchPhrases:flags,missingFacts:(body.match(/Not reported/g)||[]).length,doubleDataCenter:/data cent(?:er|re) data cent(?:er|re)/i.test(title),mainChars:body.length};
  pages.push(row);
  for(const p of ps) {const list=paragraphs.get(p)||[];list.push(u);paragraphs.set(p,list);}
  for(const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))try{JSON.parse(m[1]);}catch(e){invalidJson.push({url:u,error:e.message});}
}
const repeated=[...paragraphs].filter(([p,urls])=>urls.length>=5).map(([paragraph,urls])=>({paragraph,count:urls.length,urls})).sort((a,b)=>b.count-a.count);
const generated=pages.filter(p=>/^\/(project|company|data-centers)\/.+/.test(p.url));
const summary={pages:pages.length,generated:generated.length,missing,invalidJson,thin:generated.filter(p=>p.reportWords<150).length,long:generated.filter(p=>p.reportWords>1200).length,research:generated.filter(p=>p.researchPhrases.length).length,doubleTitles:generated.filter(p=>p.doubleDataCenter).length,missingH1:pages.filter(p=>!p.h1.length).map(p=>p.url),repeatedParagraphs:repeated.length};
fs.writeFileSync(path.join(outDir,'page-quality.json'),JSON.stringify({summary,pages,repeated},null,2));
console.log(JSON.stringify(summary,null,2));
console.log('LONGEST',JSON.stringify(generated.sort((a,b)=>b.reportWords-a.reportWords).slice(0,12).map(p=>({url:p.url,words:p.reportWords,paragraphs:p.paragraphs,maxParagraph:p.maxParagraph}))));
console.log('THINNEST',JSON.stringify(generated.sort((a,b)=>a.reportWords-b.reportWords).slice(0,18).map(p=>({url:p.url,words:p.reportWords}))));
console.log('REPEATED',JSON.stringify(repeated.slice(0,5).map(p=>({count:p.count,paragraph:p.paragraph.slice(0,350)}))));
