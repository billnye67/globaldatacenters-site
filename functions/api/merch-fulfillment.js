// Merch fulfillment — add this to stripe-webhook.js
// Called when a paid Stripe session has metadata.type === 'merch'.
// Reads the verified cart from KV, submits the order to Printify, emails you + the buyer.

export async function handleMerchOrder(env, session) {
  try {
    const orderId = session.metadata.order_id;
    const cartRaw = await env.REPORTS.get(`merch:${orderId}`);
    if (!cartRaw) {
      console.error(`No merch cart found for ${orderId}`);
      await notifyOwner(env, `⚠️ MERCH ORDER ${orderId} PAID but cart missing in KV. Stripe session: ${session.id}. Check manually.`);
      return;
    }
    const cart = JSON.parse(cartRaw);

    // Stripe collected the shipping address — map it to Printify's schema
    const ship = session.shipping_details || session.customer_details;
    const addr = ship?.address || {};
    const fullName = (ship?.name || session.customer_details?.name || 'Customer').trim();
    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ') || firstName;
    const email = session.customer_details?.email || 'orders@floridadatacenters.org';

    const printifyOrder = {
      external_id: orderId,
      label: `GDC Shop ${orderId}`,
      line_items: cart.items.map(it => ({
        product_id: it.productId,
        variant_id: it.variantId,
        quantity: it.qty
      })),
      shipping_method: 1, // 1 = standard
      send_shipping_notification: true,
      address_to: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: session.customer_details?.phone || '',
        country: addr.country || 'US',
        region: addr.state || '',
        address1: addr.line1 || '',
        address2: addr.line2 || '',
        city: addr.city || '',
        zip: addr.postal_code || ''
      }
    };

    const shopId = env.PRINTIFY_SHOP_ID;

    // 1) Create the order on Printify
    const createRes = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PRINTIFY_SK}`,
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(printifyOrder)
    });

    const createText = await createRes.text();
    if (!createRes.ok) {
      console.error('Printify order create failed:', createRes.status, createText);
      // Don't lose the order — alert owner to place it manually + refund if needed.
      await notifyOwner(env,
        `🛑 MERCH ORDER FAILED at Printify (status ${createRes.status}).\n\nOrder: ${orderId}\nStripe session: ${session.id}\nBuyer: ${fullName} <${email}>\nShip: ${JSON.stringify(printifyOrder.address_to)}\nItems: ${JSON.stringify(printifyOrder.line_items)}\n\nPrintify said: ${createText}\n\nACTION: place this order manually in Printify, or refund the customer in Stripe.`);
      // Still email buyer a receipt so they know payment worked.
      await emailBuyerReceipt(env, email, firstName, cart);
      return;
    }

    let printifyOrderId = '';
    try { printifyOrderId = JSON.parse(createText).id || ''; } catch (e) {}

    // 2) Send the order to production (orders are created on-hold by default)
    if (printifyOrderId) {
      const sendRes = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders/${printifyOrderId}/send_to_production.json`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.PRINTIFY_SK}` }
      });
      if (!sendRes.ok) {
        const t = await sendRes.text();
        console.error('send_to_production failed:', sendRes.status, t);
        await notifyOwner(env, `⚠️ MERCH ${orderId}: order created on Printify (${printifyOrderId}) but send_to_production failed (${sendRes.status}). Approve it manually in Printify. ${t}`);
      }
    }

    // 3) Re-save cart under a permanent key for your records
    await env.REPORTS.put(`merch-done:${orderId}`, JSON.stringify({
      ...cart, printifyOrderId, buyer: { name: fullName, email }, paidAt: new Date().toISOString()
    }), { expirationTtl: 60 * 60 * 24 * 180 });

    // 4) Notify you
    const itemLines = cart.items.map(it =>
      `  ${it.qty}x ${it.name}${it.color ? ' — ' + it.color : ''}${it.size && it.size !== 'One size' ? ' (' + it.size + ')' : ''}`
    ).join('\n');
    await notifyOwner(env,
      `✅ NEW MERCH ORDER — ${orderId}\nPrintify order: ${printifyOrderId || 'CHECK'}\n\nBuyer: ${fullName} <${email}>\nShip to: ${printifyOrder.address_to.address1}, ${printifyOrder.address_to.city}, ${printifyOrder.address_to.region} ${printifyOrder.address_to.zip}\n\nItems:\n${itemLines}\n\nSubtotal: $${(cart.subtotal/100).toFixed(2)}\nShipping: $${(cart.shipping/100).toFixed(2)}\n\nSent to production automatically. ${new Date().toISOString()}`);

    // 5) Receipt to buyer
    await emailBuyerReceipt(env, email, firstName, cart);

  } catch (err) {
    console.error('handleMerchOrder error:', err);
    await notifyOwner(env, `🛑 MERCH handler threw: ${err.message}. Session ${session.id}. Check logs + Stripe.`);
  }
}

async function notifyOwner(env, text) {
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'GDC Shop', email: env.BREVO_FROM || 'tips@floridadatacenters.org' },
        to: [{ email: env.CONTACT_TO_EMAIL || 'owner@example.com' }],
        subject: text.startsWith('✅') ? '✅ New merch order' : '🛑 Merch order needs attention',
        textContent: text
      })
    });
  } catch (e) { console.error('notifyOwner failed:', e); }
}

async function emailBuyerReceipt(env, email, firstName, cart) {
  try {
    const itemRows = cart.items.map(it =>
      `<tr><td style="padding:6px 0;color:#1a1915;">${it.qty}× ${it.name}${it.color ? ' — ' + it.color : ''}${it.size && it.size !== 'One size' ? ' (' + it.size + ')' : ''}</td><td style="padding:6px 0;text-align:right;color:#1a1915;">$${((it.price*it.qty)/100).toFixed(2)}</td></tr>`
    ).join('');
    const total = ((cart.subtotal + cart.shipping)/100).toFixed(2);
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f4ec;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ec;padding:32px 16px;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #c9c3b3;">
<tr><td style="text-align:center;padding:26px 32px 18px;border-bottom:2px double #1a1915;">
  <div style="font-size:21px;color:#1a1915;">Global Data Centers<span style="color:#a0231d;">.</span></div>
  <div style="font-size:11px;color:#6a665a;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;">Order Confirmed</div>
</td></tr>
<tr><td style="padding:24px 32px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a1915;">
  Hi ${firstName}, thanks for the order — every shirt, hat, and flag puts money back into the fight. We're getting it printed and shipped. You'll get tracking by email when it ships.
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;font-family:Helvetica,Arial,sans-serif;font-size:13px;border-top:1px solid #c9c3b3;">
    ${itemRows}
    <tr><td style="padding:6px 0;color:#6a665a;border-top:1px solid #c9c3b3;">Shipping</td><td style="padding:6px 0;text-align:right;color:#6a665a;border-top:1px solid #c9c3b3;">${cart.shipping === 0 ? 'Free' : '$' + (cart.shipping/100).toFixed(2)}</td></tr>
    <tr><td style="padding:8px 0;font-weight:600;color:#1a1915;">Total</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#1a1915;">$${total}</td></tr>
  </table>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #c9c3b3;text-align:center;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#6a665a;">globaldatacenters.net · Independent · Est. 2026</td></tr>
</table></td></tr></table></body></html>`;
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Global Data Centers', email: env.BREVO_FROM || 'tips@floridadatacenters.org' },
        to: [{ email, name: firstName }],
        replyTo: { email: 'james@floridadatacenters.org', name: 'James' },
        subject: 'Your Global Data Centers order is confirmed',
        htmlContent: html
      })
    });
  } catch (e) { console.error('buyer receipt failed:', e); }
}
