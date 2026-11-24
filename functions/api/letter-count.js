import { readValue } from '../_lib/order-store.js';
export async function onRequestGet({env}) {
  try {
    const old=Number.parseInt(await readValue(env,'letter-count'),10);
    return Response.json({count:Number.isFinite(old)?old:1143},{headers:{'Cache-Control':'public, max-age=60'}});
  } catch {
    return Response.json({error:'Letter count is temporarily unavailable.'},{status:503});
  }
}
