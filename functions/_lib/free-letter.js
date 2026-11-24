import { runOrder, countLetters, readRecord, readValue, writeRecord, writeValue, serialize, stableToken } from './order-store.js';
import { sendOrderMail, escapeHtml } from './mail.js';
import { placeLabel, workOrderPlace, workOrderSteps, isUSOrder } from './order-text.js';
import { buildFreeReceipt } from './free-receipt.js';

export async function claimFreeLetter(env,data) {
  const email=data.email.trim().toLowerCase(),code=data.code,id='free:'+await stableToken(email);
  // Queues coordinate this worker only; existing KV consistency limits remain.
  return serialize(env,'claim-email:'+email,()=>serialize(env,'claim-ref:'+code,async()=>{
    const previous=await readRecord(env,'order:'+id);
    if(previous && previous.payload.code!==code)throw new Error('This email already has a letter order.');
    if(await readValue(env,'order-complete:'+id))return {duplicate:true};
    if(!previous && (await readValue(env,'free-claim:'+email)||await readValue(env,'has-order:'+email)))
      throw new Error('This email already has a letter order.');
    const ref=await readRecord(env,'ref:'+code);
    const reserved=Array.isArray(ref?.claims)&&ref.claims.includes(id);
    const created=Date.parse(ref?.created),expires=Number.isFinite(created)?created+90*86400000:Date.now()+90*86400000;
    if(!reserved && (!ref || expires<=Date.now() || !(Number(ref.uses_remaining)>0)))
      throw new Error('This referral link has expired, is invalid, or has been fully claimed.');
    return runOrder(env,id,'free',{...data,email},async m=>{
    if(!reserved) {
      await writeRecord(env,'ref:'+code,{...ref,uses_remaining:Number(ref.uses_remaining)-1,claims:[...(ref.claims||[]),id]},Math.max(60,Math.ceil((expires-Date.now())/1000)));
    }
    const sender={name:'Global Data Centers',email:env.BREVO_FROM||'james@floridadatacenters.org'};
    await sendOrderMail(env,id,'owner',{
      sender,to:[{email:env.CONTACT_TO_EMAIL||'owner@example.com'}],replyTo:{email:m.email,name:m.name},
      subject:`FREE LETTER — [REFERRAL] ${m.name} — ${placeLabel(m)}`,
      textContent:`FREE LETTER CLAIM\nName: ${m.name}\nEmail: ${m.email}\n${workOrderPlace(m)}\nConcerns: ${Array.isArray(m.concerns)?m.concerns.join(', '):m.concerns}\nReferred by: ${ref?.buyer_name||''} (${ref?.buyer_email||''})\nReferral: ${m.code}\nOrder: ${id}\n\n${workOrderSteps(m,1)}\n4. CC the resident at ${m.email}`
    });
    const safe=Object.fromEntries(Object.entries(m).map(([k,v])=>[k,escapeHtml(v)]));
    await sendOrderMail(env,id,'buyer',{
      sender,to:[{email:m.email,name:m.name}],replyTo:{email:sender.email,name:'James'},
      subject:isUSOrder(m)?`Your free letter to ${m.county} County commissioners is on the way`:'Your free letter to your local officials is on the way',
      htmlContent:buildFreeReceipt(safe)
    });
    await countLetters(env,id,1);
    await writeValue(env,'free-claim:'+email,new Date().toISOString(),365*86400);
    });
  }));
}
