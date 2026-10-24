# Acme Notes

Notes your whole team can find. A Next.js (App Router) app with Tailwind CSS and shadcn/ui.

## Run it

```bash
npm install
npm run dev
```

With no environment variables the app runs in demo mode: every page renders, auth gating is off, and a notice says Supabase is not configured.

To run against a live Supabase project and Stripe (test mode), copy `.env.example` to `.env.local` and fill in the variables. Apply the SQL in `supabase/migrations/` in filename order to a fresh project.

## Where things live

- `src/config/site.ts`: brand name, theme settings, SEO defaults.
- `src/app/globals.css`: colour tokens (emerald primary, cyan highlight, gray neutral).
- `content/blog/`: blog posts as MDX with frontmatter.
- `src/app/api/`: JSON API for organizations, invitations, billing checkout and the Stripe webhook.
- `src/lib/orgs/`: organization queries and actions; every query runs under the user's session (RLS).
- `supabase/migrations/`: schema, helper functions and row level security policies.
