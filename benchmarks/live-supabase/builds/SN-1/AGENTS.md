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
- **Landing page:** `src/app/(landing)/page.tsx` composes the sections in `src/app/(landing)/components/` (Hero, Features, Steps, Testimonials, Pricing, Faq); they read their copy from `src/content/landing.ts`. Header and Footer are in the same folder; menus come from `src/content/misc/navigation.ts`.
- **Blog:** MDX posts in `src/content/blog/*.mdx` (frontmatter: title, summary, publishedAt, tag, image). `/blog/[slug]` is statically generated.
- **Legal:** `src/content/legal/*.mdx`, served at `/privacy` and `/terms`.
- Routes: `/`, `/blog`, `/blog/[slug]`, `/privacy`, `/terms`

### Dashboard & product shell
- **Signed-in shell:** `src/app/(product)/layout.tsx` with `components/Sidebar.tsx` and `components/Header.tsx` (org switcher, user menu). Org pages: `src/app/(product)/app/[org]/` (dashboard, members, settings). `/app` redirects to the first org, `/app/demo` in demo mode.
- Routes: `/app`, `/app/[org]`, `/app/[org]/members`, `/app/[org]/settings`, `/profile`

### Supabase auth
- **Auth:** pages in `src/app/(auth)/auth/` (sign in, sign up, forgot password) and `/auth/update-password`. Supabase clients in `src/lib/sb/`; rate limiting and route gating in `src/lib/sb/proxy.ts` and `src/lib/sb/middleware.ts`, run from `src/proxy.ts`. `isSupabaseConfigured()` in `src/lib/sb/config.ts` switches demo mode (no env vars: nothing gated, sample data). Schema: `supabase/migrations/` (applied in filename order).
- Routes: `/auth`, `/auth/update-password`

### Organization billing (Stripe)
- **Billing:** an organization's `plan` (`free` or `team`) is a column on `organizations`. Checkout: `src/lib/billing/checkout.ts` and `POST /api/orgs/[org]/billing/checkout`; webhook `src/app/api/webhooks/stripe` sets `team` on `checkout.session.completed`. Stripe calls go to `STRIPE_API_BASE` when set (`src/lib/billing/stripe.ts`). The upgrade button is in Settings.

### Organizations & multi-tenancy
- **Organizations:** guards in `src/lib/orgs/server.ts`; every org-scoped query goes through them (RLS is on with no policies). Roles and `DEMO_ORG_SLUG` in `src/lib/orgs/types.ts`; invitations in `src/lib/orgs/invitations.ts` and `src/app/(orgs)/invite/[token]`; API in `src/app/api/orgs/` and `src/app/api/invitations/`. Schema: `supabase/migrations/`.
- Routes: `/invite/[token]`

## Copy

The scaffold carries no template identity: the product name, logo and email come from `schema` in `src/resources/once-ui.config.js`, and every other line of copy is a placeholder in these files:

- `src/content/landing.ts`: hero, features, steps, section headings, CTA, banner, blog intro.
- `src/content/misc/` (`faq.js`, `navigation.ts`), `src/content/pricing/pricing.js` (the two plans).
- `src/content/blog/*.mdx`, `src/content/legal/*.mdx` (`<ProductName />` and `<ContactEmail />` read from `schema`).
- `src/resources/seo.js`: page titles and descriptions, built from `schema.name`.

Logo: `public/logo.svg`. Images: `public/images/` (the OG image and whatever the pages show).

## Checking your work

`npm run typecheck`, then `npm run build` (needs no environment variables: the app runs in demo mode), then `npm start` and request the pages.
