# Acme Notes: notes for coding agents

Brand name, theme and SEO defaults live in `src/resources/once-ui.config.js`; per-page SEO in `src/resources/seo.js`. Migrations are in `supabase/migrations/` (apply in filename order). Plans (`free`/`team`) are `organizations.plan`; Stripe checkout is `src/lib/billing/server.ts` and the webhook `src/app/api/webhooks/stripe`. Blog posts: `src/content/blog/*.mdx`. Members/Dashboard/Settings pages: `src/app/(product)/app/[org]/`.

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
- **Landing page:** `src/app/(landing)/page.tsx` composes the sections in `src/app/(landing)/components/` (Hero, Features, Showcase, Steps, Testimonials, Pricing, Faq). Several sections hold their copy inline; edit or replace them there. Header and Footer are in the same folder; menus come from `src/content/misc/navigation.tsx`.
- **Copy:** `src/content/` (about, brand, pricing, `misc/faq.js`, `misc/testimonials.js`).
- **Blog:** MDX posts in `src/content/blog/*.mdx` (frontmatter: title, summary, publishedAt, tag, image). `/blog/[slug]` is statically generated.
- **Legal:** `src/content/legal/*.mdx`, served at `/privacy-policy` and `/terms-of-use` (rename the route folders to change the URLs).
- Routes: `/`, `/about`, `/blog`, `/blog/[slug]`, `/brand`, `/contact`, `/pricing`, `/privacy-policy`, `/products/dashboard`, `/products/landing`, `/terms-of-use`

### Dashboard & product shell
- **Signed-in shell:** `src/app/(product)/layout.tsx` with `components/Sidebar.tsx` and `components/Header.tsx` (org switcher, user menu). Org pages: `src/app/(product)/app/[org]/` (home, analytics, users, settings). `/app` redirects to the first org, `/app/demo` in demo mode.
- Routes: `/app`, `/app/[org]`, `/app/[org]/analytics`, `/app/[org]/billing`, `/app/[org]/settings`, `/app/[org]/users`, `/profile`

### Supabase auth
- **Auth:** pages in `src/app/(auth)/auth/` (sign in, sign up, forgot password) and `/auth/update-password`. Supabase clients in `src/lib/sb/`; rate limiting and route gating in `src/lib/sb/proxy.ts` and `src/lib/sb/middleware.ts`, run from `src/proxy.ts`. `isSupabaseConfigured()` in `src/lib/sb/config.ts` switches demo mode (no env vars: nothing gated, sample data). Schema: `supabase/init.sql`.
- Routes: `/auth`, `/auth/update-password`

### Organization billing (Stripe)

- Routes: `/app/[org]/billing`

### Organizations & multi-tenancy
- **Organizations:** guards in `src/lib/orgs/server.ts`; every org-scoped query goes through them (RLS is on with no policies). Roles and `DEMO_ORG_SLUG` in `src/lib/orgs/types.ts`; invitations in `src/lib/orgs/invitations.ts` and `src/app/(orgs)/invite/[token]`; API in `src/app/api/orgs/` and `src/app/api/invitations/`. Schema: `supabase/orgs.sql`, run after `init.sql`.
- Routes: `/invite/[token]`

## Checking your work

`npm run typecheck`, then `npm run build` (needs no environment variables: the app runs in demo mode), then `npm start` and request the pages.
