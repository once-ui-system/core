# Acme Notes

Notes your whole team can find. A Next.js (App Router) app with Tailwind CSS and shadcn/ui.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

With no environment variables set the app runs in demo mode: every page renders with sample data,
sign-in is off and a notice says Supabase is not configured.

To run against Supabase and Stripe (test mode), copy `.env.example` to `.env.local` and fill it in.

## Where things live

- `src/config/site.ts`: brand name, tagline, canonical URL, theme colors and SEO defaults.
- `src/lib/seo.ts`: per-page metadata built from the config.
- `src/content/blog/*.mdx`: blog posts (frontmatter: `title`, `date`, `summary`).
- `supabase/migrations/`: SQL applied in filename order to a fresh Supabase project.
- `src/proxy.ts`: refreshes the Supabase session and sends signed-out visitors from `/app` to `/auth`.
- `src/lib/orgs/`: organization access, roles and data operations.
- `src/app/api/`: the JSON API and the Stripe webhook (`/api/webhooks/stripe`).

## Checks

```bash
npx tsc --noEmit
npx next build
npx next start
```
