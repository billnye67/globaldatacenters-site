// Retired: only the signed Stripe webhook may establish a paid order.
export async function onRequestPost() {
  return Response.json({error:'This confirmation endpoint has been retired.'},{status:410});
}
