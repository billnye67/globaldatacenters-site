import { runOrder, readRecord, readValue, writeRecord, writeValue, countLetters } from './order-store.js';
import { sendOrderMail, escapeHtml } from './mail.js';
import { placeLabel, workOrderPlace, workOrderSteps, receiptSubject } from './order-text.js';
import { buildReceiptEmail } from './letter-receipt.js';

const ttl=60*60*24*90;
const sender=env=>({name:'Global Data Centers',email:env.BREVO_FROM||'james@floridadatacenters.org'});
const money=cents=>'$'+(cents/100).toFixed(2);

export function paymentDetails(session) {
  const m=session.metadata||{};
  const qty=m.quantity==null?1:Number(m.quantity),total=Number(session.amount_total),tip=Number(m.tip_cents||0);
  if(!Number.isInteger(qty)||qty<0||qty>100||!Number.isInteger(total)||total<0||!Number.isInteger(tip)||tip<0||tip>total)
    throw new Error('Invalid letter payment amounts');
  if((session.currency||'usd').toLowerCase()!=='usd')throw new Error('Unsupported letter currency');
  if(!m.email||!m.name||!m.concerns)throw new Error('Missing letter order metadata');
  if(qty===0&&tip!==total)throw new Error('Donation-only payment does not reconcile');
  return {qty,total,tip};
}

export async function fulfillPaidLetters(env,session) {
  if(session.payment_status!=='paid')throw new Error('Payment has not been confirmed');
  const id='stripe:'+session.id;
  const previous=await readRecord(env,'order:'+id);
  // Existing Florida orders already have this marker. Do not recreate their work.
  if(!previous && await readValue(env,'session-ref:'+session.id))return {duplicate:true,legacy:true};
  return runOrder(env,id,'paid',session,async saved=>{
    const m=saved.metadata,{qty,total,tip}=paymentDetails(saved);
    let ref='';
    if(qty>0) {
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(saved.id));
      ref=Array.from(new Uint8Array(digest)).slice(0,10).map(b=>b.toString(16).padStart(2,'0')).join('');
      if(!await readRecord(env,'ref:'+ref))await writeRecord(env,'ref:'+ref,{uses_remaining:3,buyer_email:m.email,buyer_name:m.name,county:m.county||'',created:new Date().toISOString()},ttl);
      if(!await readValue(env,'session-ref:'+saved.id))await writeValue(env,'session-ref:'+saved.id,ref,60*60*24*7);
      if(!await readValue(env,'has-order:'+m.email.toLowerCase()))await writeRecord(env,'has-order:'+m.email.toLowerCase(),{type:'paid',created:new Date().toISOString()},365*86400);
    }
    const description=qty?`${qty} opposition letter${qty===1?'':'s'}`:'Donation';
    const action=qty?workOrderSteps(m,qty)+`\n4. CC the resident at ${m.email}`:'Donation only. No paid letters to fulfill.';
    await sendOrderMail(env,id,'owner',{
      sender:sender(env),to:[{email:env.CONTACT_TO_EMAIL||'owner@example.com'}],replyTo:{email:m.email,name:m.name},
      subject:`PAID ${money(total)} — ${description} — ${m.name}`,
      textContent:`Payment confirmed by Stripe.\n\nName: ${m.name}\nEmail: ${m.email}\n${workOrderPlace(m)}\nConcerns: ${m.concerns}\nPaid letters: ${qty}\nLetter amount: ${money(total-tip)}\nDonation: ${money(tip)}\nTotal paid: ${money(total)}\nStripe session: ${saved.id}\n\n${action}`
    });
    const safe=Object.fromEntries(Object.entries(m).map(([k,v])=>[k,escapeHtml(v)]));
    await sendOrderMail(env,id,'buyer',{
      sender:sender(env),to:[{email:m.email,name:m.name}],replyTo:{email:env.BREVO_FROM||'james@floridadatacenters.org',name:'James'},
      subject:qty?receiptSubject(m):'Thank you for supporting Global Data Centers',
      htmlContent:qty?buildReceiptEmail(safe,qty,total/100,ref,tip/100):
        `<!doctype html><html><body style="font-family:Georgia,serif;color:#1a1915;background:#f7f4ec;padding:24px"><h1 style="font-size:24px">Global Data Centers</h1><p>Hi ${escapeHtml(m.name.split(' ')[0])},</p><p>Thank you for your donation of ${money(total)}. This payment does not include paid letters.</p><p>Questions? Reply to this email.</p><p>James · Global Data Centers</p></body></html>`
    });
    await countLetters(env,id,qty);
  });
}

export async function fulfillWeeklyLetters(env,stripe,invoice) {
  const subscriptionId=invoice.subscription||invoice.parent?.subscription_details?.subscription;
  if(!subscriptionId)return;
  const sub=await stripe.subscriptions.retrieve(subscriptionId),m=sub?.metadata||{};
  if(m.type!=='takeaction-weekly'||!m.concerns)return;
  if(invoice.paid!==true&&invoice.status!=='paid')throw new Error('Invoice is not paid');
  const quantity=Number(m.quantity||1);
  if(!Number.isInteger(quantity)||quantity<1||quantity>100)throw new Error('Invalid weekly quantity');
  return runOrder(env,'invoice:'+invoice.id,'weekly',{invoice,metadata:m},async saved=>{
    const current=saved.metadata,q=Number(current.quantity||1),amount=saved.invoice.amount_paid;
    if(!Number.isInteger(amount)||amount<0)throw new Error('Invalid invoice amount');
    await sendOrderMail(env,'invoice:'+invoice.id,'owner',{
      sender:sender(env),to:[{email:env.CONTACT_TO_EMAIL||'owner@example.com'}],
      subject:`WEEKLY ${money(amount)} (${q} letters) — ${current.name}`,
      textContent:`Paid weekly letter order\n${workOrderPlace(current)}\nName: ${current.name}\nEmail: ${current.email}\nConcerns: ${current.concerns}\nLetters: ${q}\nAmount paid: ${money(amount)}\nInvoice: ${saved.invoice.id}\nSubscription: ${subscriptionId}\n\n${workOrderSteps(current,q)}\n4. CC the resident at ${current.email}`
    });
    await countLetters(env,'invoice:'+invoice.id,q);
  });
}
