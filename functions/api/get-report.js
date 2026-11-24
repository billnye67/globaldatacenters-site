// Cloudflare Pages Function — returns the generated Defense Kit for a given order ID

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id');

  if (!orderId) {
    return new Response(
      JSON.stringify({ error: 'Missing order_id' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const reportRaw = await env.REPORTS.get(`report:${orderId}`);

    if (!reportRaw) {
      // Either still generating, or the order doesn't exist
      return new Response(
        JSON.stringify({ status: 'pending', message: 'Your Brief is being generated. This usually takes 30-60 seconds.' }),
        { status: 202, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const report = JSON.parse(reportRaw);
    return new Response(
      JSON.stringify(report),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Get report error:', err);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
