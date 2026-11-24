import { brevoUrl } from './order-text.js';
import { readRecord, readValue, writeRecord, stableToken } from './order-store.js';
export async function sendMail(env,payload,token) {
  const response=await fetch(brevoUrl(env)+'/v3/smtp/email',{
    method:'POST',headers:{accept:'application/json','api-key':env.BREVO_API_KEY,'content-type':'application/json'},
    // Plain request, as the Florida site sent it: Brevo rejected the idempotencyKey header with a 400.
    // Duplicates are still prevented by the order-mail-sent record in sendOrderMail.
    body:JSON.stringify(payload),
    signal:AbortSignal.timeout(8000)
  });
  const text=await response.text();let data;try{data=JSON.parse(text);}catch{data={};}
  if(!response.ok){
    if(token&&data.code==='duplicate_parameter'&&/idempoten/i.test(data.message||''))return {duplicate:true};
    const error=new Error('Email provider rejected request ('+response.status+'): '+String(data.code||'')+' '+String(data.message||text).slice(0,200));
    error.definitelyRejected=response.status>=400&&response.status<500;
    throw error;
  }
  return data;
}
export async function sendOrderMail(env,orderId,step,payload) {
  const id=orderId+':'+step;
  if(await readValue(env,'order-mail-sent:'+id))return;
  let row=await readRecord(env,'order-mail:'+id);
  const rejection=await readRecord(env,'order-mail-rejected:'+id);
  if(!row || (rejection && rejection.at>=row.attempted_at)) {
    row={payload,token:await stableToken('mail:'+id),attempted_at:Date.now()};
    await writeRecord(env,'order-mail:'+id,row);
  }
  // Brevo deduplicates for 15 minutes. Never blindly resend after an uncertain
  // acceptance outlives that window: retain the order for owner reconciliation.
  if(Date.now()-row.attempted_at>=14*60*1000)
    throw new Error('Email acceptance needs review: '+id);
  let result;
  try{result=await sendMail(env,row.payload,row.token);}
  catch(error){
    if(error.definitelyRejected)await writeRecord(env,'order-mail-rejected:'+id,{at:Date.now()});
    throw error;
  }
  await writeRecord(env,'order-mail-sent:'+id,{message_id:result.messageId||null,at:Date.now()});
}
export function escapeHtml(value) {
  return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
