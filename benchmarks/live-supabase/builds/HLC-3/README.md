# Acme Notes

Notes your whole team can find. A Next.js (App Router) app with Tailwind CSS and shadcn/ui.

## Run it

```bash
npm install
npm run build        # works with no environment variables (demo mode)
npx next start       # then open http://localhost:3000
```

With no environment variables set, the app runs in demo mode: no sign-in is required, sample
data is shown, and a notice says Supabase is not configured.

## Live services

Copy `.env.example` to `.env.local` and fill in the Supabase and Stripe test-mode values.
Apply the SQL in `supabase/migrations/` to a fresh Supabase project in filename order.

- Stripe webhook: `POST /api/webhooks/stripe`, subscribed to `checkout.session.completed`.
- `STRIPE_API_BASE` redirects every Stripe API call, for example to a local stripe-mock.

## Layout

- `src/config/site.ts`: brand name, theme colors, SEO defaults, pricing.
- `src/app/`: landing page, blog, legal pages, auth pages, and the signed-in app under `/app`.
- `src/content/blog/`: MDX posts. Each file exports `meta` (title, date, summary).
- `src/lib/supabase/`: Supabase clients and the session proxy (`src/proxy.ts`).
- `src/lib/orgs/`: organization access checks shared by pages and JSON routes.
- `src/app/api/`: JSON API for organizations, members, invitations, billing and the webhook.
