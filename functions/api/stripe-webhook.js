// Cloudflare Pages Function — Stripe webhook handler
// Fires when payment succeeds → generates Defense Kit via Gemini → stores in KV → emails link

import Stripe from 'stripe';
import {fulfillPaidLetters, fulfillWeeklyLetters} from '../_lib/letter-fulfillment.js';
import { buildDefenseKitPrompt } from './defense-kit-prompt.js';
import { handleMerchOrder } from './merch-fulfillment.js';
import { brevoUrl } from '../_lib/order-text.js';

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context;

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    // Verify webhook signature using Web Crypto (Cloudflare-compatible)
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response('Signature verification failed', { status: 400 });
    }

    if (!['checkout.session.completed','checkout.session.async_payment_succeeded','invoice.paid'].includes(event.type)) {
      return new Response('Event type not handled', { status: 200 });
    }

    // Weekly subscription cycles (first AND every renewal) arrive as invoice.paid.
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      if (invoice.subscription || invoice.parent?.subscription_details?.subscription) {
        await fulfillWeeklyLetters(env, stripe, invoice);
      }
      return new Response('OK', { status: 200 });
    }

    const session = event.data.object;

    // Delayed payments complete their checkout before money settles. Their later
    // async_payment_succeeded event performs fulfillment through the same order key.
    if (session.payment_status !== 'paid') return new Response('Payment pending', {status:200});

    // A subscription's first payment ALSO fires checkout.session.completed.
    // Skip it — invoice.paid handles every cycle including the first, so letters don't double-send.
    if (session.mode === 'subscription' || session.metadata.type === 'takeaction-weekly') {
      return new Response('OK', { status: 200 });
    }

    // Route: Take Action order (has concerns in metadata) vs Defense Kit (has order_id)
    if (session.metadata.type === 'merch') {
      waitUntil(handleMerchOrder(env, session));
      return new Response('OK', { status: 200 });
    }

    if (session.metadata.concerns) {
      await fulfillPaidLetters(env, session);
      return new Response('OK', { status: 200 });
    }

    const orderId = session.metadata.order_id;

    // Run generation in background so we respond to Stripe within 30s
    waitUntil(generateDefenseKit(env, orderId, session));

    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('Webhook error:', err);
    // The reason goes back to Stripe so it shows in the dashboard's delivery log (no customer data in it).
    return new Response('Server error: ' + String(err && err.message || err).slice(0, 300), { status: 500 });
  }
}

async function generateDefenseKit(env, orderId, session) {
  try {
    // Retrieve intake from KV
    const intakeRaw = await env.REPORTS.get(`intake:${orderId}`);
    if (!intakeRaw) {
      console.error(`No intake found for order ${orderId}`);
      await env.REPORTS.put(`report:${orderId}`, JSON.stringify({
        status: 'error',
        error: 'Intake data not found. Please contact support.'
      }));
      return;
    }

    const intake = JSON.parse(intakeRaw);

    // Enrich intake with county project data + risk tier
    const enriched = enrichIntake(intake);

    // Build the Gemini prompt
    const prompt = buildDefenseKitPrompt(enriched);

    // Call Gemini 2.5 Flash
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 8192
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      await env.REPORTS.put(`report:${orderId}`, JSON.stringify({
        status: 'error',
        error: 'AI generation failed. Your payment will be refunded. Please contact support.'
      }));
      return;
    }

    const geminiData = await geminiResponse.json();
    const reportHtml = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!reportHtml || reportHtml.length < 1000) {
      console.error('Gemini returned too-short response:', reportHtml);
      await env.REPORTS.put(`report:${orderId}`, JSON.stringify({
        status: 'error',
        error: 'Report generation incomplete. Please contact support.'
      }));
      return;
    }

    // Store final report in KV
    const report = {
      status: 'complete',
      orderId,
      generatedAt: new Date().toISOString(),
      intake: enriched,
      reportHtml
    };

    await env.REPORTS.put(`report:${orderId}`, JSON.stringify(report), {
      expirationTtl: 60 * 60 * 24 * 180 // 180 days
    });

    // Delete the temporary intake entry
    await env.REPORTS.delete(`intake:${orderId}`);

    // Send email via Brevo with permanent link
    const reportUrl = `https://floridadatacenters.org/defense-kit-success?order_id=${orderId}`;

    await fetch(brevoUrl(env) + '/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Global Data Centers',
          email: 'reports@floridadatacenters.org'
        },
        to: [{ email: intake.email, name: intake.firstName }],
        subject: `Your ${intake.county} County Data Center Preparation Brief`,
        htmlContent: `
          <p>Hi ${intake.firstName},</p>
          <p>Your personalized Data Center Preparation Brief for ${intake.county} County is ready.</p>
          <p><a href="${reportUrl}" style="background: #a0231d; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 3px;">View Your Brief</a></p>
          <p>Bookmark the link above — you can come back to your Brief anytime for up to 180 days. It includes your pre-written public comment letter, hearing script, and everything else we prepared for your specific situation.</p>
          <p>If you have questions or need corrections, just reply to this email.</p>
          <p>— Global Data Centers</p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">This Preparation Brief is educational, not legal advice. Consult a Florida-licensed attorney before taking action that affects your legal or property rights.</p>
        `
      })
    });

  } catch (err) {
    console.error('Defense Kit generation error:', err);
    await env.REPORTS.put(`report:${orderId}`, JSON.stringify({
      status: 'error',
      error: 'Generation failed. Please contact support for a refund.'
    }));
  }
}

// Enrich intake with county-specific context pulled from our knowledge
function enrichIntake(intake) {
  const countyProjects = {
    'palm beach': 'Project Tango (Palm Beach County) — proposed by Cosmic Energy near FPL\'s West County Energy Center',
    'polk': 'Fort Meade Data Center (Polk County) — approved April 2026, Duke Energy Hines Complex',
    'st. lucie': 'Early-stage proposal on former citrus grove land, Epic Estates 68 LLC; application withdrawn February 2026 pending state legislation',
    'okeechobee': 'Okee-One Data Campus (Okeechobee County) — Indian River State College, 9-10 MW, former Florida School for Boys site. CANCELED April 23, 2026 by Governor\'s office after community pushback. County commissioners also voted to remove the "Special Technology Opportunity Centers" section from the comprehensive plan. 205-acre site is still state college land; structural conditions unchanged.',
    'martin': 'Indiantown Data Center Proposal — early-stage, three-hearing comprehensive plan amendment process',
    'citrus': 'Deltona Corp Comprehensive Plan Amendment — ~813 acres, operator and specifications not yet public',
    'nassau': 'NextNRG Nassau County Campus — 1,600 acres near Jacksonville International Airport, 200 MW on-site microgrid'
  };

  const countyKey = intake.county.toLowerCase().replace(' county', '').trim();
  const nearestProject = countyProjects[countyKey] || null;

  const riskTier = nearestProject ? 'Moderate to High' : 'Moderate';
  const riskScore = nearestProject ? 65 : 50;

  return {
    ...intake,
    nearestProject,
    riskTier,
    riskScore
  };
}
