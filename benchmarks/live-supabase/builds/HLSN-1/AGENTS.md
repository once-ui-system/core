# Acme Notes: notes for coding agents

Read this before the tree: it says where everything lives, so you can go straight to the files a task needs.
Built with Next.js App Router (16) and `@once-ui-system/core`. The spec is in `SPEC.md`.

## Map

### Shell
- **Brand, theme, fonts:** `src/resources/once-ui.config.js`: `baseURL` (canonical URL), `fonts`, `style` (brand emerald, accent cyan, neutral gray, dark by default), `schema` (name, tagline, description, logo, email).
- **SEO:** `src/resources/seo.js` exports one object per surface (`landing`, `auth`, `product`), with title, description, path, robots and canonical. Pages read their entry for `metadata`.
- **Root layout and providers:** `src/app/layout.tsx` (fonts, ThemeInit, metadata fallback), `src/components/Providers.tsx`.
- **Plans:** `src/resources/plans.json` (Free $0, up to 3 members; Team $8 per member per month). Shown on the landing page.
- **Copy:** landing copy in `src/content/landing.ts`; blog posts are MDX in `src/content/blog/`, read by `src/lib/blog.ts`.

### Public site: `src/app/(landing)/`
- `/` (home: hero, three features, pricing), `/blog`, `/blog/[slug]` (static), `/privacy`, `/terms`.
- Header and footer, plus the sections, in `src/app/(landing)/components/`.

### Sign-in: `src/app/(account)/`
- `/auth`: sign in, sign up, forgot password (`components/auth/AuthForm.tsx`). `/auth/update-password`: new password after a reset.
- `/auth/callback`: exchanges the emailed code for a session, then redirects to `next`.
- `/invite/[token]`: accept page; a signed-in user joins through `POST /api/invitations/[token]`.

### Signed-in app: `src/app/(product)/`
- Shell (`components/product/Shell.tsx`): header with org switcher and user menu, sidebar (Dashboard, Members, Settings), mobile drawer.
- `/app` sends the user to their first organization, or shows the create form. `/app/new` creates one.
- `/app/[org]` (dashboard, four stat cards), `/app/[org]/members` (list and invite), `/app/[org]/settings` (rename, plan and upgrade), `/profile`.
- Demo mode (no Supabase variables): `/app` redirects to `/app/demo`, which shows sample data.

### Data, auth and orgs
- **Supabase clients:** `src/lib/sb/`: `config.ts` (`isSupabaseConfigured()`), `browser.ts`, `server.ts` (cookies), `admin.ts` (service role), `session.ts` (proxy).
- **Gating:** `src/proxy.ts` redirects `/app` and `/profile` to `/auth` when signed out.
- **Orgs:** `src/lib/orgs/`: `roles.ts`, `data.ts` (all queries), `guard.ts` (`apiAccess` for routes, `loadOrgPage` for pages), `validate.ts`, `tokens.ts` (invite tokens: 7 days, SHA-256 stored), `slug.ts`, `demo.ts`.
- **Billing:** `src/lib/billing/stripe.ts` (Checkout session via REST, honours `STRIPE_API_BASE`), `webhook.ts` (`Stripe-Signature` check).
- **Schema:** `supabase/migrations/`, applied in filename order. `0001` tables, `0002` RLS on every public table. RLS has no policies; all access goes through the service-role client after `guard.ts` checks membership and role.

### JSON API: `src/app/api/`
- `POST /api/orgs`, `GET|PATCH /api/orgs/[org]`, `GET /api/orgs/[org]/members`, `POST /api/orgs/[org]/invitations`, `POST /api/orgs/[org]/billing/checkout`, `POST /api/invitations/[token]`, `POST /api/webhooks/stripe`.
- Status codes: 401 signed out, 403 not a member or not allowed, 404 unknown org, 503 not configured, 400 bad input, 410 expired invitation.

## Checking your work

`npm run typecheck`, then `npm run build` (no environment variables needed: demo mode), then `npx next start -p 3804` and request the pages. Section 8 (live Supabase and Stripe) needs the real services; the SQL can be checked by applying `supabase/migrations/` in order to a scratch database.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
