const {webkit}=require('playwright'),assert=require('assert/strict');
(async()=>{
 const browser=await webkit.launch();try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let mode='claim-fail',claims=0,checkouts=0,summary={status:'ready',kind:'donation',country:'GB'};
 await page.route('**/*',async r=>{
  const u=new URL(r.request().url());
  if(u.hostname==='checkout.example.invalid')return r.fulfill({body:'Simulated checkout'});
  if(u.pathname==='/api/take-action'){checkouts++;return r.fulfill({status:mode==='checkout-fail'?500:200,contentType:'application/json',body:JSON.stringify(mode==='checkout-fail'?{error:'Payment setup failed.'}:{redirect:'https://checkout.example.invalid/session'})});}
  if(u.pathname==='/api/claim-letter'){claims++;return r.fulfill({status:mode==='claim-fail'?400:200,contentType:'application/json',body:JSON.stringify(mode==='claim-fail'?{error:'Referral unavailable. Please try again.'}:{success:true})});}
  if(u.pathname==='/api/get-referral-code')return r.fulfill({contentType:'application/json',body:JSON.stringify(summary)});
  if(u.pathname==='/api/letter-count')return r.fulfill({contentType:'application/json',body:'{"count":1200}'});
  if(r.request().method()!=='GET')return r.abort();
  return r.continue();
 });
 async function form(quantity){
  await page.goto('http://127.0.0.1:8787/take-action?country=GB&ref=test-ref',{waitUntil:'domcontentloaded'});
  await page.locator('#ta-name').fill('Audit Person');await page.locator('#ta-email').fill('audit@example.invalid');await page.locator('#ta-address').fill('1 Example Road, London');
  await page.locator('label').filter({has:page.locator('input[name="concern"]')}).first().click();
  if(quantity>1)await page.locator('#ta-qty-plus').click();
  await page.locator('#ta-btn').click();await page.locator('#ta-modal-skip').click();
 }
 await form(2);await page.waitForFunction(()=>document.querySelector('#ta-error').textContent.includes('Referral unavailable'));assert.equal(checkouts,1);assert.equal(claims,1);assert(page.url().includes('/take-action?'));assert(!await page.locator('#ta-btn').isDisabled());console.log('PASS failed mixed referral stays on page and offers a retry');
 mode='checkout-fail';claims=0;await form(2);await page.waitForFunction(()=>document.querySelector('#ta-error').textContent.includes('Payment setup failed'));assert.equal(claims,0);console.log('PASS failed checkout does not consume a free claim');
 mode='ok';claims=0;await form(2);await page.waitForURL('https://checkout.example.invalid/session');assert.equal(claims,1);console.log('PASS paid referral reaches checkout only after free claim confirmation');
 await form(1);await page.waitForURL('**/take-action-success?free=1&country=GB');assert((await page.locator('#confirmation-summary').textContent()).includes('local officials'));assert(await page.locator('.referral-block').isHidden());console.log('PASS international free confirmation uses local officials and offers no nonexistent referral code');
 for(const state of [{status:'ready',kind:'donation',country:'GB'},{status:'ready',kind:'letter',country:'GB',code:'testcode'},{status:'pending',kind:'letter',country:'US'}]){
  summary=state;await page.goto('http://127.0.0.1:8787/take-action-success?session_id=cs_mock',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#confirmation-summary').textContent!=='Checking your order confirmation…');
  const text=await page.locator('#confirmation-summary').textContent();
  if(state.kind==='donation'){assert(text.includes('does not include paid letters'));assert(await page.locator('#confirmation-next').isHidden());assert(await page.locator('.referral-block').isHidden());}
  else if(state.status==='ready'){assert(text.includes('local officials'));assert(!text.includes('county commissioners'));assert(await page.locator('.referral-block').isVisible());}
  else {assert(text.includes('no need to pay again'));assert(await page.locator('#confirmation-next').isHidden());}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
 }
 assert.deepEqual(errors,[]);console.log('PASS donation, international paid, and pending confirmation states; no overflow or JavaScript errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
