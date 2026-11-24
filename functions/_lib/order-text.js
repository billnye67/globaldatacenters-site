// Shared wording for letter order emails: the work order that comes to us, and the
// receipt that goes to the buyer.
//
// It lives here because stripe-webhook.js and take-action-confirm.js were writing the
// same work order text twice, and the two copies had already drifted.
//
// The rule throughout: a United States order renders exactly the strings it always has,
// character for character. Only an order that carries a non-US country code takes the
// other branch. An order with no country at all is treated as US, which is what every
// order placed before the country field existed looks like.

// One place to point the Brevo calls somewhere else while testing. Unset in production,
// so the default is the real API and nothing changes.
export function brevoUrl(env) {
  return (env && env.BREVO_API_BASE) || 'https://api.brevo.com';
}

export function isUSOrder(m) {
  const c = String((m && m.country) || '').trim().toUpperCase();
  return c === '' || c === 'US' || c === 'USA' || c === 'UNITED STATES';
}

// "IE" reads as a typo in a receipt, so turn it into "Ireland" where the runtime can.
// Intl is available in Workers and in Node; anything it cannot name falls back to the
// code itself rather than to nothing.
export function countryName(code) {
  const raw = String(code || '').trim();
  if (!raw) return '';
  if (raw.length !== 2) return raw;
  try {
    const code = raw.toUpperCase();
    const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code);
    // A code Intl does not know comes back as "Unknown Region", which reads worse in a
    // work order than the code itself. Anything it cannot name falls back to the code.
    if (!name || name === code || /unknown/i.test(name)) return code;
    return name;
  } catch (e) {
    return raw.toUpperCase();
  }
}

// Where the order is, for subject lines and the receipt table.
export function placeLabel(m) {
  if (isUSOrder(m)) return `${m.county} County, ${m.state}`;
  const bits = [String(m.address || '').trim(), countryName(m.country)].filter(Boolean);
  return bits.join(', ') || countryName(m.country) || 'Address on file';
}

// Who the letters go to.
export function officialsLabel(m) {
  return isUSOrder(m) ? 'All county commissioners' : 'Local officials';
}

// The address block in the work order.
export function workOrderPlace(m) {
  if (isUSOrder(m)) {
    return `Address: ${m.address}
State: ${m.state}
County: ${m.county}`;
  }
  return `Address: ${m.address}
Country: ${countryName(m.country)}`;
}

// Steps 1 to 3 of the work order. Step 4 differs between the two callers, so it stays
// with them.
export function workOrderSteps(m, qty) {
  const plural = qty > 1 ? 's' : '';
  if (isUSOrder(m)) {
    return `1. Research ${m.county} County, ${m.state} commissioners — names, titles, emails
2. Write ${qty} personalized opposition letter${plural} citing relevant state/local statutes
3. Send to all commissioners from james@floridadatacenters.org`;
  }
  return `1. Research the local officials for ${placeLabel(m)} — the council, authority or ministry that decides planning there, with names, titles and emails
2. Write ${qty} personalized opposition letter${plural} citing the local planning rules that apply
3. Send to those officials from james@floridadatacenters.org`;
}

// The buyer receipt subject.
export function receiptSubject(m) {
  return isUSOrder(m)
    ? `Your letter to ${m.county} County commissioners is confirmed`
    : 'Your letter to your local officials is confirmed';
}

// The label on the left of the place row in the receipt table.
export function receiptPlaceRowLabel(m) {
  return isUSOrder(m) ? 'County' : 'Location';
}

// The line under the order table.
export function receiptBodyLine(m, firstName) {
  return isUSOrder(m)
    ? `Hi ${firstName} — you'll receive a copy of your letter and confirmation of every commissioner it was sent to. Emails to county commissioners are public records. Your opposition is documented permanently.`
    : `Hi ${firstName} — you'll receive a copy of your letter and confirmation of every official it was sent to. Letters to local officials go on the public record in most places. Your opposition is documented.`;
}

// The referral block talks about the neighbour's officials, not the buyer's.
export function referralOfficials(m) {
  return isUSOrder(m) ? 'their commissioners' : 'their local officials';
}
