import { assertOrderStorage } from '../_lib/order-store.js';

// Cloudflare Pages Function — Take Action handler
// Creates a Stripe Checkout Session with the correct quantity
// Fulfillment runs only from the signed Stripe webhook after payment confirms.

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { name, email, address, state, county, concerns, quantity, tip, zip, country } = data;

    // A county is how US officials are found. Outside the US there is no equivalent to
    // ask for, so the town in the address is enough and the county stays empty.
    const iso = typeof country === 'string' && /^[A-Za-z]{2}$/.test(country) ? country.toUpperCase() : '';
    const isUS = iso === '' || iso === 'US';

    if (!name || !email || !address || (isUS && !county) || !concerns || concerns.length === 0) {
      return new Response(
        JSON.stringify({ error: 'All fields are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the Florida site's existing storage binding before taking payment.
    await assertOrderStorage(env);

    // Donation: server-side clamp, whole cents only
    const tipCents = Math.min(200000, Math.max(0, Math.round((parseFloat(tip) || 0) * 100)));
    // Referral users may pay 0 letters + a donation; otherwise at least 1 letter
    const minQty = tipCents > 0 ? 0 : 1;
    const qty = Math.max(minQty, Math.min(100, parseInt(quantity) || 0));
    if (qty === 0 && tipCents === 0) {
      return new Response(JSON.stringify({ error: 'Nothing to charge.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Add to newsletter list (this is fine to do before payment)
    const listId = parseInt(env.BREVO_LIST_ID) || 3;
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        listIds: [listId],
        updateEnabled: true,
        attributes: {
          FIRSTNAME: name.split(' ')[0],
          SOURCE: 'take-action',
          COUNTY: county || '',
          COUNTRY: iso || 'US'
        }
      })
    }).catch(() => {});

    // Create Stripe Checkout Session with correct quantity
    const stripeKey = env.STRIPE_SECRET_KEY;
    const priceId = env.STRIPE_PRICE_ID;
    const siteUrl = env.SITE_URL || 'https://globaldatacenters.net';

    const concernsList = Array.isArray(concerns) ? concerns.join(', ') : concerns;

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    let li = 0;
    if (qty > 0) {
      params.append(`line_items[${li}][price]`, priceId);
      params.append(`line_items[${li}][quantity]`, qty.toString());
      li++;
    }
    if (tipCents > 0) {
      params.append(`line_items[${li}][price_data][currency]`, 'usd');
      params.append(`line_items[${li}][price_data][unit_amount]`, tipCents.toString());
      params.append(`line_items[${li}][price_data][product_data][name]`, 'Donation — research, outreach & site costs');
      params.append(`line_items[${li}][quantity]`, '1');
    }
    // Pass session_id in success URL so the success page can look up the referral code
    params.append('success_url', siteUrl + '/take-action-success?session_id={CHECKOUT_SESSION_ID}');
    params.append('cancel_url', siteUrl + '/take-action#form');
    params.append('customer_email', email);
    params.append('metadata[name]', name);
    params.append('metadata[email]', email);
    params.append('metadata[address]', address);
    params.append('metadata[state]', state || '');
    params.append('metadata[county]', county || '');
    // Carried through to the receipt and the work order so whoever researches the
    // officials knows which country's system they are looking at.
    params.append('metadata[country]', iso || 'US');
    params.append('metadata[concerns]', concernsList);
    params.append('metadata[quantity]', qty.toString());
    params.append('metadata[tip_cents]', tipCents.toString());
    params.append('metadata[mode]', 'once');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(stripeKey + ':'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok || session.error || !session.url) {
      console.error('Stripe error:', session.error);
      return new Response(
        JSON.stringify({ error: 'Payment setup failed. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ redirect: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Take action error:', err);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
