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
- **Landing page:** `src/app/(landing)/page.tsx`; copy for features and plans in `src/content/site.ts`. Header and Footer in `src/app/(landing)/components/`.
- **Blog:** MDX posts in `src/content/blog/*.mdx` (frontmatter: title, summary, publishedAt). `/blog/[slug]` is statically generated. Open Graph image: `src/app/api/og/route.tsx`.
- **Legal:** `/privacy` and `/terms` (`src/app/(landing)/privacy`, `terms`).
- **Brand and SEO defaults:** `src/resources/once-ui.config.js` (`brand`, `seoDefaults`), per-page values in `src/resources/seo.js`.
- Routes: `/`, `/blog`, `/blog/[slug]`, `/privacy`, `/terms`

### Dashboard & product shell
- **Signed-in shell:** `src/app/(product)/layout.tsx` with `components/Sidebar.tsx` and `components/Header.tsx` (org switcher, user menu). Org pages: `src/app/(product)/app/[org]/` (dashboard, members, settings). `/app` redirects to the first org, `/app/demo` in demo mode.
- Routes: `/app`, `/app/[org]`, `/app/[org]/members`, `/app/[org]/settings`, `/profile`

### Supabase auth
- **Auth:** pages in `src/app/(auth)/auth/` (sign in, sign up, forgot password) and `/auth/update-password`. Supabase clients in `src/lib/sb/`; rate limiting and route gating in `src/lib/sb/proxy.ts` and `src/lib/sb/middleware.ts`, run from `src/proxy.ts`. `isSupabaseConfigured()` in `src/lib/sb/config.ts` switches demo mode (no env vars: nothing gated, sample data). Schema: `supabase/migrations/` (apply in filename order).
- Routes: `/auth`, `/auth/update-password`

### Organization billing (Stripe)
- **Billing:** each organization has a `plan` (`free` or `team`, column on `organizations`). Checkout (`src/lib/billing/server.ts`, `POST /api/orgs/{org}/billing/checkout`) uses `STRIPE_PRICE_TEAM`; the webhook `src/app/api/webhooks/stripe` verifies the signature and sets the plan on `checkout.session.completed`. `STRIPE_API_BASE` redirects every Stripe call.

### Organizations & multi-tenancy
- **Organizations:** guards in `src/lib/orgs/server.ts`; every org-scoped query goes through them (RLS is on with no policies). Roles and `DEMO_ORG_SLUG` in `src/lib/orgs/types.ts`; invitations in `src/lib/orgs/invitations.ts` and `src/app/(orgs)/invite/[token]`; API in `src/app/api/orgs/` and `src/app/api/invitations/`. Schema: `supabase/migrations/`.
- Routes: `/invite/[token]`

## Checking your work

`npm run typecheck`, then `npm run build` (needs no environment variables: the app runs in demo mode), then `npm start` and request the pages.
