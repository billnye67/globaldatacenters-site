import {placeLabel,officialsLabel,receiptPlaceRowLabel,receiptBodyLine,referralOfficials} from './order-text.js';

export function buildReceiptEmail(m, qty, total, refCode, tip = 0) {
  const fbGroupUrl = 'https://www.facebook.com/share/g/1E4cBXRuBS/';
  const freeLetterUrl = `https://globaldatacenters.net/free?code=${refCode}`;
  const firstName = m.name ? m.name.split(' ')[0] : 'there';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><style>:root{color-scheme:light only;}</style></head>
<body style="margin:0;padding:0;background:#f7f4ec;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ec;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #c9c3b3;">

<!-- HEADER -->
<tr><td style="text-align:center;padding:28px 32px 20px;border-bottom:2px double #1a1915;">
  <img src="https://globaldatacenters.net/favicon-192.png" width="48" height="48" alt="FDC" style="display:block;margin:0 auto 10px;border-radius:6px;">
  <div style="font-size:22px;font-weight:500;letter-spacing:-0.02em;color:#1a1915;">Global Data Centers<span style="color:#a0231d;">.</span></div>
  <div style="font-size:11px;color:#6a665a;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;">Independent &middot; Est. 2026</div>
</td></tr>

<!-- CONFIRMATION -->
<tr><td style="text-align:center;padding:28px 32px 24px;">
  <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:#2f4a35;color:#f7f4ec;font-size:20px;line-height:48px;text-align:center;">&#10003;</div>
  <div style="font-size:18px;font-weight:500;margin-top:12px;color:#1a1915;">Your opposition is on the record.</div>
</td></tr>

<!-- ORDER DETAILS -->
<tr><td style="padding:0 32px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eae5d8;border-left:3px solid #2f4a35;font-family:Helvetica,Arial,sans-serif;font-size:13px;">
    <tr><td width="40%" style="color:#6a665a;padding:12px 16px 4px;">Order</td><td width="60%" style="text-align:right;padding:12px 16px 4px;color:#1a1915;">${qty}x Opposition letter${qty > 1 ? 's' : ''}</td></tr>
    <tr><td style="color:#6a665a;padding:4px 16px;">${receiptPlaceRowLabel(m)}</td><td style="text-align:right;padding:4px 16px;color:#1a1915;">${placeLabel(m)}</td></tr>
    <tr><td style="color:#6a665a;padding:4px 16px;">Recipients</td><td style="text-align:right;padding:4px 16px;color:#1a1915;">${officialsLabel(m)}</td></tr>
    <tr><td style="color:#6a665a;padding:4px 16px;">Status</td><td style="text-align:right;padding:4px 16px;font-weight:600;color:#2f4a35;">Writing &amp; sending within 24 hrs</td></tr>
    <tr><td colspan="2" style="padding:4px 16px 0;"><div style="border-top:1px solid #c9c3b3;"></div></td></tr>
    <tr><td style="color:#6a665a;padding:8px 16px 12px;font-weight:600;">Total</td><td style="text-align:right;padding:8px 16px 12px;font-weight:600;color:#1a1915;">$${Number(total).toFixed(2)}</td></tr>
  </table>
</td></tr>

<!-- BODY TEXT -->
${tip > 0 ? '<tr><td style="padding:0 32px 16px;font-family:Arial,sans-serif;font-size:13px;">Includes a donation of $' + Number(tip).toFixed(2) + '.</td></tr>' : ''}
<tr><td style="padding:0 32px 24px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#1a1915;">
  ${receiptBodyLine(m, firstName)}
</td></tr>

<!-- REFERRAL CTA -->
<tr><td style="padding:0 32px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#a0231d" style="background-color:#a0231d;">
    <tr><td style="padding:24px 28px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:600;color:#ffffff;margin-bottom:14px;text-align:center;">Send your neighbor a free letter.</div>
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#ffffff;margin-bottom:18px;">Your link works for up to 3 neighbors. Share it below — we'll send a <b>free opposition letter</b> to ${referralOfficials(m)} on their behalf. When a neighbor claims theirs, we'll send an <b>additional follow-up on your behalf</b> before the next meeting.</div>
      <div style="text-align:center;margin-bottom:10px;">
        <table cellpadding="0" cellspacing="0" align="center"><tr><td bgcolor="#f7f4ec" style="background-color:#f7f4ec;padding:12px 28px;border-radius:4px;">
          <a href="${freeLetterUrl}" style="color:#a0231d;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;">globaldatacenters.net/free</a>
        </td></tr></table>
      </div>
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;text-align:center;color:#ffffff;">Copy and share — text it, drop it in your HOA chat, or post it in your local Facebook group</div>
    </td></tr>
  </table>
</td></tr>

<!-- FACEBOOK GROUP -->
<tr><td style="padding:0 32px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eae5d8;">
    <tr><td style="text-align:center;padding:20px 24px;">
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#6a665a;margin-bottom:10px;">Thousands of residents across the country are fighting back</div>
      <table cellpadding="0" cellspacing="0" align="center"><tr><td bgcolor="#1877f2" style="background-color:#1877f2;padding:8px 20px;border-radius:4px;">
        <a href="${fbGroupUrl}" style="color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;text-decoration:none;">Join the movement</a>
      </td></tr></table>
    </td></tr>
  </table>
</td></tr>

<!-- FOUNDER NOTE -->
<tr><td style="padding:0 32px 20px;border-top:1px solid #c9c3b3;">
  <div style="text-align:center;padding-top:20px;">
    <div style="font-size:13px;font-style:italic;color:#6a665a;line-height:1.6;max-width:400px;margin:0 auto;">"Every letter satisfies a two-fold purpose: it puts your opposition on permanent public record, and it shows commissioners their residents are paying attention."</div>
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#6a665a;margin-top:8px;">— James, Global Data Centers</div>
  </div>
</td></tr>

<!-- FOOTER -->
<tr><td style="padding:20px 32px;border-top:1px solid #c9c3b3;text-align:center;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#6a665a;">
  globaldatacenters.net &middot; Independent reporting &middot; Est. 2026<br>
  <span style="margin-top:4px;display:inline-block;">You're receiving this because you purchased a letter.</span>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}

