# Reusing the Florida backend

The Global Data Centers site is built in the existing `floridadc` repository. Its Cloudflare Pages Functions already contain the Florida site's Stripe checkout/webhook, Brevo email/newsletter, Printify shop, reports, report admin, referrals and letter-count handlers. There is no separate backend code migration to perform.

The proposed D1 order database has been removed. Do not create an `ORDER_DB` binding or apply the withdrawn SQL migration. No database, binding, deployment, or new API credentials were created during this local repair.

## Existing configuration

Reuse the existing `REPORTS` KV namespace and the existing provider settings. Depending on the enabled feature, the handlers read:

- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`.
- Brevo: `BREVO_API_KEY`, optional `BREVO_LIST_ID`, `BREVO_FROM`, `CONTACT_TO_EMAIL`.
- Printify: `PRINTIFY_SK`, `PRINTIFY_SHOP_ID`.
- Reports/admin: `GEMINI_API_KEY`, `ADMIN_PASSWORD`.
- Alerts: optional `ALERTS_SECRET` (existing Brevo-key fallback is retained).
- Geocoding: preserve the existing map/geocoding configuration separately.

These are existing setting names, not a request to generate replacement keys. Keep the existing verified email sender addresses. The local checkout does not contain the deployed payment/email secrets.

If the new domain uses the same Cloudflare Pages project, its project configuration can be reused. If it uses a separate project, connect the existing storage namespace and corresponding secrets there through Cloudflare. Confirm production and preview settings separately. Actual account/project bindings were not verified from this local checkout.

Check `SITE_URL` if configured: main letter checkout honors it; its fallback is `https://globaldatacenters.net`. Keep the existing Stripe webhook URL and signing secret. Middleware preserves `/api/` on the old Florida domain so those requests are not redirected. If delayed payment methods are enabled, the Stripe webhook subscription must include `checkout.session.async_payment_succeeded`.

## Compatibility and remaining limits

Existing `ref:`, `session-ref:`, `has-order:`, `free-claim:` and `letter-count` records retain their original keys. Referral claims update the existing remaining-use field. New retry checkpoints use additional keys in the same namespace; no import job is needed.

Paid letter processing is awaited so failures can be retried. Saved email steps and stable Brevo idempotency keys reduce duplicate sends. A free claim can resume using its original email and referral link. An uncertain email acceptance older than the provider's deduplication window is held for manual reconciliation rather than blindly resent; private `order-error:` and `order-mail:` records identify it.

REPORTS remains eventually consistent KV. Local queues coordinate a single worker, not separate Cloudflare workers or regions. Referral limits and letter-count updates are not atomic across workers, and a partial write can leave the displayed count inaccurate. The repair does not claim exactly-once global fulfillment. Older payments can only be recognized while their original markers remain available; do not bulk replay historical events without reconciliation.

References: [Cloudflare KV consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works/), [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Brevo idempotency](https://developers.brevo.com/changelog/2021/11/10).

## Verification

- `node tools/check-order-reliability.mjs`: 24 scenarios using simulated REPORTS and providers; no real charges or email sends.
- `node tools/check-order-ui.cjs`: mobile checkout/referral and confirmation checks.

These checks passed locally. They do not validate deployed credentials, webhook subscriptions, sender verification or live payment delivery. The phone preview at port 8787 serves the site/geocoder, not a complete production payment environment. The website is not deployed by these commands.
