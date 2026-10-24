# Acme Notes: notes for coding agents

Read this before the tree: it says where everything lives, so you can go straight to the files a task needs.
Built with Next.js App Router and `@once-ui-system/core`; composition in `stack.json`.

## Map

### Shell
- **Brand, theme, fonts:** `src/resources/once-ui.config.js` — `baseURL`, `fonts`, `style` (brand, accent, neutral, border, theme mode), `dataStyle`, `schema` (product name, logo, email), `social`.
- **Language:** `i18n.locales` in `src/resources/once-ui.config.js` (first = default; sets `<html lang>` and how prices are formatted). Server: `getLocale()` from `src/lib/i18n/server.ts`; client: `useLocale()` from `src/components/LocaleProvider.tsx`. A surface's UI text lives in `src/content/<surface>/labels.ts` (one entry per locale), read with `labelsFor()` from `src/lib/i18n`; translate there, not in components.
- **SEO:** `src/resources/seo.js` exports one object per surface (title, description, path, image); pages pass them to `Meta.generate` and `<Schema>`.
- **Root layout and providers:** `src/app/layout.tsx`, `src/components/Providers.tsx`. MDX rendering: `src/components/Mdx.tsx`. Icons: `src/resources/icons.ts`.
- **Content barrel:** `src/content/index.ts` re-exports the copy files under `src/content/`.

### Landing & marketing
- **Landing page:** `src/app/(landing)/page.tsx` composes Hero, Features and Pricing from `src/app/(landing)/components/`; copy and plans are in `src/content/landing.ts`. Menus: `src/content/misc/navigation.ts`.
- **Blog:** MDX posts in `src/content/blog/*.mdx` (frontmatter: title, summary, publishedAt, tag, image). `/blog/[slug]` is statically generated.
- **Legal:** `src/content/legal/privacy.mdx` and `terms.mdx`, served at `/privacy` and `/terms`.
- Routes: `/`, `/blog`, `/blog/[slug]`, `/privacy`, `/terms`

### Dashboard (signed in)
- **Shell:** `src/app/(product)/layout.tsx` with `components/Sidebar.tsx` (Dashboard, Members, Settings) and `components/Header.tsx` (org switcher, user menu). Org pages in `src/app/(product)/app/[org]/`: dashboard (four stat cards), `members` (list and invite links), `settings` (rename, plan, upgrade). `/app` redirects to the first org, `/app/demo` in demo mode.
- Routes: `/app`, `/app/[org]`, `/app/[org]/members`, `/app/[org]/settings`, `/profile`

### Supabase auth
- **Auth:** pages in `src/app/(auth)/auth/` (sign in at `/auth`, sign up, forgot password) and `/auth/update-password`. Supabase clients in `src/lib/sb/`; route gating in `src/lib/sb/middleware.ts`, run from `src/proxy.ts`. `isSupabaseConfigured()` in `src/lib/sb/config.ts` switches demo mode (no env vars: nothing gated, sample data, a notice in the layout). SQL: `supabase/migrations/`, applied in filename order.

### Organizations & billing
- **Organizations:** guards in `src/lib/orgs/server.ts`; every org-scoped query goes through them (RLS is on with no policies; the service role does the work after the guard). Roles and `DEMO_ORG_SLUG` in `src/lib/orgs/types.ts`; invitations in `src/lib/orgs/invitations.ts` (token hash stored, 7 days) and the accept page `src/app/(orgs)/invite/[token]`.
- **JSON API:** `src/app/api/orgs/` (create, read, members, invitations, `billing/checkout`) and `src/app/api/invitations/[token]`.
- **Billing:** `organizations.plan` (`free`/`team`). Checkout (`src/app/api/orgs/[org]/billing/checkout`) creates a Stripe Checkout session for `STRIPE_PRICE_TEAM` with the org id as `client_reference_id`; the webhook `src/app/api/webhooks/stripe` verifies the signature and sets the plan on `checkout.session.completed`. Stripe calls go through `src/lib/billing/stripe.ts` (`STRIPE_API_BASE` overrides the host).

## Checking your work

`npm run typecheck`, then `npm run build` (needs no environment variables: the app runs in demo mode), then `npm start` and request the pages.
