// Diagnostic only: every outbound request and KV operation is simulated.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, '.source-cache/launch-sweep-20260927/backend.json');
const load = p => import(pathToFileURL(path.join(root, p)));
const requests = [];
let providerStatus = 201;
globalThis.fetch = async (url, options = {}) => {
  requests.push({ url: String(url), body: options.body });
  if (String(url).includes('api.stripe.com')) return Response.json({ id: 'cs_simulated', url: 'https://checkout.example.invalid/test' });
  return Response.json({ simulated: true }, { status: providerStatus });
};
const makeEnv = () => {
  const map = new Map([['letter-count','1200']]);
  return { STRIPE_SECRET_KEY: 'fake', STRIPE_PRICE_ID: 'fake', BREVO_API_KEY: 'fake', CONTACT_TO_EMAIL: 'audit@example.invalid',
    map, REPORTS: { get: async k => map.get(k) ?? null, put: async (k,v) => map.set(k,v), delete: async k => map.delete(k) } };
};
const body = { name: 'Audit Example', email: 'audit@example.invalid', address: '1 Example Road', state: 'Georgia', county: 'Example', country: 'US', concerns: ['water'], quantity: 1 };
const ctx = (data,env=makeEnv()) => ({ env, request: new Request('https://audit.example.invalid/api/test', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)}) });
const findings = {};
const confirm = await load('functions/api/take-action-confirm.js');
let res = await confirm.onRequestPost(ctx(body));
findings.unverifiedPaidConfirmation = { status:res.status, result:await res.json(), outboundRequests:requests.map(r=>({url:r.url, subject:JSON.parse(r.body).subject, text:JSON.parse(r.body).textContent})), suppliedPaymentProof:false };
requests.length=0; providerStatus=500;
res = await (await load('functions/api/contact.js')).onRequestPost(ctx({email:body.email,name:body.name,type:'contact',message:'A simulated customer message for the audit.'}));
findings.contactProviderFailure = {providerStatus,status:res.status,result:await res.json(),requests:requests.length};
requests.length=0; providerStatus=201;
res = await (await load('functions/api/claim-letter.js')).onRequestPost(ctx({...body,country:'GB',county:'',state:'England',code:'audit-ref'}));
findings.internationalReferral = {status:res.status,result:await res.json(),requests:requests.length};
let webhook = fs.readFileSync(path.join(root,'functions/api/stripe-webhook.js'),'utf8');
webhook = webhook.replace(/import Stripe from 'stripe';/, 'const Stripe = null;');
webhook = webhook.replace(/from '([.][^']+)'/g, (_,p)=>`from '${pathToFileURL(path.resolve(root,'functions/api',p)).href}'`);
const {handleTakeAction} = await import('data:text/javascript,'+encodeURIComponent(webhook+'\nexport {handleTakeAction};'));
const env = makeEnv(), session={id:'cs_simulated_repeat',amount_total:900,metadata:{...body,concerns:'water',quantity:'1'}};
await handleTakeAction(env,session); await handleTakeAction(env,session);
findings.repeatedPaidSession = {initialCounter:1200,finalCounter:env.map.get('letter-count'),emails:requests.length,referralCodes:[...env.map.keys()].filter(k=>k.startsWith('ref:')).length};
requests.length=0;
await handleTakeAction(makeEnv(),{...session,id:'cs_simulated_tip',amount_total:500,metadata:{...session.metadata,quantity:'0',tip_cents:'500'}});
findings.donationOnly = {actualPaidCents:500,paidLetters:0,emails:requests.map(r=>({subject:JSON.parse(r.body).subject,text:JSON.parse(r.body).textContent||''}))};
requests.length=0;
res = await (await load('functions/api/take-action.js')).onRequestPost(ctx({...body,country:'GB',county:'',quantity:0,tip:5}));
const stripe = requests.find(r=>r.url.includes('api.stripe.com'));
findings.mainCheckout = {status:res.status,result:await res.json(),stripeParams:Object.fromEntries(new URLSearchParams(stripe.body))};
fs.writeFileSync(out,JSON.stringify(findings,null,2));
console.log(JSON.stringify(findings,null,2));
