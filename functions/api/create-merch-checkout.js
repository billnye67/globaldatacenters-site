// Cloudflare Pages Function — creates a Stripe checkout session for MERCH orders
// POST { items: [{variantId, productId, qty}], shipping: <cents>, address: {...} }
// Prices are re-verified server-side against the trusted catalog — never trust client prices.

import Stripe from 'stripe';
import { verifiedCart, quoteShipping } from '../_lib/merch-shipping.js';



export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { items, address } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: 'Cart is empty' }, 400);
    }

    let verified;
    try { verified = verifiedCart(items); }
    catch(error) { return json({error:error.message},400); }
    const quote = await quoteShipping(env,verified,address);
    const subtotal = quote.subtotal, shippingCents = quote.shipping;

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    const orderId = `merch_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    // Store the verified cart in KV so the webhook can fulfill after payment.
    await env.REPORTS.put(`merch:${orderId}`, JSON.stringify({
      items: verified,
      subtotal,
      shipping: shippingCents,
      address: address || null,
      created: new Date().toISOString()
    }), { expirationTtl: 60 * 60 * 6 }); // 6 hours; webhook re-saves on success

    // Build Stripe line items from verified prices
    const line_items = verified.map(it => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: it.name,
          description: [it.color, it.size && it.size !== 'One size' ? it.size : '']
            .filter(Boolean).join(' · ') || undefined,
          images: it.img ? [it.img] : undefined
        },
        unit_amount: it.price
      },
      quantity: it.qty
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      shipping_address_collection: { allowed_countries: ['US'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingCents, currency: 'usd' },
            display_name: shippingCents === 0 ? 'Free shipping' : 'Standard shipping'
          }
        }
      ],
      metadata: {
        type: 'merch',
        order_id: orderId,
        item_count: String(verified.reduce((n, it) => n + it.qty, 0))
      },
      success_url: `https://globaldatacenters.net/shop-success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://globaldatacenters.net/shop?cancelled=true`
    });

    return json({ url: session.url, orderId });

  } catch (err) {
    console.error('create-merch-checkout error:', err);
    return json({ error: 'Failed to create checkout session' }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
