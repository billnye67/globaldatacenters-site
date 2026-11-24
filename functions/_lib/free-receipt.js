import {isUSOrder} from './order-text.js';
export function buildFreeReceipt(m) {
const claimerFirstName=m.name.split(' ')[0],officials=isUSOrder(m)?m.county+' County commissioners':'your local officials';
const fbGroupUrl='https://www.facebook.com/share/g/1E4cBXRuBS/';
return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f7f4ec;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ec;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #c9c3b3;">

<tr><td style="text-align:center;padding:28px 32px 20px;border-bottom:2px double #1a1915;">
  <img src="https://globaldatacenters.net/favicon-192.png" width="48" height="48" alt="FDC" style="display:block;margin:0 auto 10px;border-radius:6px;">
  <div style="font-size:22px;font-weight:500;letter-spacing:-0.02em;color:#1a1915;">Global Data Centers<span style="color:#a0231d;">.</span></div>
  <div style="font-size:11px;color:#6a665a;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;">Independent · Est. 2026</div>
</td></tr>

<tr><td style="text-align:center;padding:28px 32px 24px;">
  <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:#2f4a35;color:#f7f4ec;font-size:20px;line-height:48px;text-align:center;">&#10003;</div>
  <div style="font-size:18px;font-weight:500;margin-top:12px;color:#1a1915;">Your free letter is on the way.</div>
</td></tr>

<tr><td style="padding:0 32px 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#1a1915;">
  Hi ${claimerFirstName} — a neighbor referred you and we're writing a personalized opposition letter to ${officials} on your behalf. You'll receive a copy within 24 hours with the full text and every commissioner email it was sent to.
</td></tr>

<tr><td style="padding:0 32px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eae5d8;border-radius:6px;">
    <tr><td style="text-align:center;padding:20px 24px;">
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#6a665a;margin-bottom:10px;">Thousands of residents across the country are fighting back</div>
      <a href="${fbGroupUrl}" style="display:inline-block;background:#1877f2;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;padding:8px 20px;border-radius:4px;text-decoration:none;">Join the movement</a>
    </td></tr>
  </table>
</td></tr>

<tr><td style="padding:0 32px 24px;text-align:center;">
  <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#6a665a;margin-bottom:12px;">Every letter gets read. Show your local officials you're not backing down.</div>
  <a href="https://globaldatacenters.net/take-action" style="display:inline-block;background:#a0231d;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;padding:10px 24px;border-radius:4px;text-decoration:none;">Send another letter — $9</a>
</td></tr>

<tr><td style="padding:20px 32px;border-top:1px solid #c9c3b3;text-align:center;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:#6a665a;">
  globaldatacenters.net · Independent reporting · Est. 2026
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}
