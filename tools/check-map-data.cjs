const assert=require('assert/strict'),fs=require('fs'),{webkit}=require('playwright');
const {mapFields,sourceUrl}=require('../data/globe-record-fields.cjs');
const projects=JSON.parse(fs.readFileSync('data/projects.json','utf8')).projects;
const globe=JSON.parse(fs.readFileSync('data/globe.json','utf8'));
const old=JSON.parse(fs.readFileSync('.source-cache/technical-repair-20260927/data/globe.json','utf8'));
const oldSites=new Map(old.sites.map(p=>[p.id,p]));
for(const p of globe.sites){const before=oldSites.get(p.id);assert(before);for(const k of ['lat','lng','name','mw','status','kind','country'])assert.deepEqual(p[k],before[k]);assert(!p.src||sourceUrl(p.src));}
assert.equal(globe.sites.length,old.sites.length);
assert.equal(mapFields(projects.find(p=>p.id==='epoch-alibaba-zhangbei')).type,'approx');
assert.equal(mapFields({lat:1,lng:2,geocode:'address-approx (google)',sources:['note','https://example.org/source']}).src,'https://example.org/source');
console.log('PASS compiled map preserves all sites, positions, capacities and statuses; citations are URLs only');
(async()=>{
 const browser=await webkit.launch();try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const tile=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64');
 await page.route(/server\.arcgisonline\.com\//,r=>r.fulfill({contentType:'image/png',headers:{'access-control-allow-origin':'*'},body:tile}));
 await page.goto('http://127.0.0.1:8787/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__locations?.length>2000&&window.__warmed);
 await page.locator('.globe-tap').click();await page.waitForTimeout(4200);
 const cards=await page.evaluate(()=>['gemini-microsoft-south-central','epoch-alibaba-zhangbei','gemini-aligned-phoenix'].map(id=>{
  const p=window.__locations.find(x=>x.id===id);window.__closeCard();window.__showCard(p,true);
  return {id,approx:p.approx,status:document.querySelector('#card-facts').textContent,body:document.querySelector('#card-body').textContent,flyHidden:document.querySelector('#card-fly').hidden,sourceHidden:document.querySelector('#card-link').hidden,href:document.querySelector('#card-link').getAttribute('href')};
 }));
 assert(cards[0].status.includes('Not reported'));assert(!cards[0].status.includes('Proposed'));assert(cards[0].flyHidden);assert(cards[1].flyHidden);assert(cards[1].body.includes('exact site not confirmed'));
 for(const c of cards)assert(c.sourceHidden||/^https?:\/\//.test(c.href));
 await page.locator('#filter-status').selectOption('unknown');
 assert(await page.evaluate(()=>window.__visibleLocations().filter(p=>p.type==='project').every(p=>!/propos|operat|construct|approv/i.test(p.status))));
 await page.locator('#filter-status').selectOption('proposed');
 assert(await page.evaluate(()=>window.__visibleLocations().every(p=>p.status&&p.status!=='unknown')));
 await page.locator('#filter-status').selectOption('');
 const precise=await page.evaluate(()=>{const p=window.__locations.find(x=>x.type==='project'&&!x.approx&&!x.blk);window.__closeCard();window.__showCard(p,true);return {hidden:document.querySelector('#card-fly').hidden,name:p.name};});assert(!precise.hidden);
 assert.deepEqual(errors,[]);console.log('PASS unknown/proposed filters, approximate location warning, valid source links, and precise-site action',JSON.stringify(cards));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
