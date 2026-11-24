// Cloudflare Pages Function — creates a Stripe checkout session for Defense Kit

import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const intake = await request.json();

    // Validate required fields
    const required = ['email', 'firstName', 'lastInitial', 'streetAddress', 'zipCode', 'county', 'topConcerns', 'attendingHearing'];
    for (const field of required) {
      if (!intake[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!Array.isArray(intake.topConcerns) || intake.topConcerns.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one concern must be selected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    // Create a unique order ID (used as KV key)
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    // Store intake in KV so webhook can retrieve it after payment
    await env.REPORTS.put(`intake:${orderId}`, JSON.stringify(intake), {
      expirationTtl: 3600 // 1 hour — webhook will re-save as report:orderId later
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      customer_email: intake.email,
      metadata: {
        order_id: orderId,
        county: intake.county,
        zip: intake.zipCode
      },
      success_url: `https://globaldatacenters.net/defense-kit-success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://globaldatacenters.net/defense-kit?cancelled=true`
    });

    return new Response(
      JSON.stringify({ url: session.url, orderId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Create checkout error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
