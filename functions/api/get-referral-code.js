import { readRecord, readValue } from '../_lib/order-store.js';
// Cloudflare Pages Function — looks up referral code by Stripe session ID
// Called from take-action-success.html after payment

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Missing session_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    {
      const order = await readRecord(env,'order:stripe:' + sessionId);
      if (order) {
        const payment = order.payload, m = payment.metadata || {};
        const donation = Number(m.quantity) === 0;
        const ready = Boolean(await readValue(env,'order-complete:stripe:' + sessionId));
        const code = !donation && ready ? await readValue(env,`session-ref:${sessionId}`) : null;
        return Response.json({status:ready?'ready':'pending',kind:donation?'donation':'letter',country:m.country||'US',code:code||null},
          {headers:{'Cache-Control':'no-store'}});
      }
    }
    const refCode = await readValue(env,`session-ref:${sessionId}`);
    if (!refCode) {
      // Webhook may not have fired yet — return pending
      return new Response(JSON.stringify({ status: 'pending' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ status: 'ready', code: refCode }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('get-referral-code error:', err);
    return new Response(JSON.stringify({ status: 'pending' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
