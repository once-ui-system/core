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
- **Billing:** plans in `src/resources/plans.json`; Stripe logic in `src/lib/billing/`; org page `src/app/(product)/app/[org]/billing`; webhook `src/app/api/webhooks/stripe`. Without `STRIPE_SECRET_KEY` checkout runs in mock mode. Schema: `supabase/billing.sql`, run after `orgs.sql`.
- Routes: `/app/[org]/billing`

### Organizations & multi-tenancy
- **Organizations:** guards in `src/lib/orgs/server.ts`; every org-scoped query goes through them (RLS is on with no policies). Roles and `DEMO_ORG_SLUG` in `src/lib/orgs/types.ts`; invitations in `src/lib/orgs/invitations.ts` and `src/app/(orgs)/invite/[token]`; API in `src/app/api/orgs/` and `src/app/api/invitations/`. Schema: `supabase/orgs.sql`, run after `init.sql`.
- Routes: `/invite/[token]`

## Rebranding

These files still carry the template's identity (name, URLs, trademarks, demo copy). Replace or delete what the app does not need; keep the auth, org and billing code as it is unless the task says otherwise.

- `src/resources/seo.js` (30)
- `src/content/misc/testimonials.js` (19)
- `src/app/(landing)/brand/client.tsx` (12)
- `src/app/(landing)/products/components/Bento.tsx` (6)
- `src/app/(landing)/products/dashboard/page.tsx` (6)
- `src/app/(landing)/products/landing/page.tsx` (6)
- `src/content/about/about.js` (6)
- `src/app/(product)/app/[org]/components/TableClient.tsx` (5)
- `src/content/misc/faq.js` (3)
- `src/components/Mdx.tsx` (2)
- `src/app/(landing)/components/Footer.tsx` (2)
- `src/app/(landing)/components/Header.tsx` (2)
- `src/content/blog/post-1.mdx` (2)
- `src/content/blog/post-4.mdx` (2)
- `src/content/blog/post-5.mdx` (2)
- `src/content/blog/post-6.mdx` (2)
- `src/content/misc/navigation.tsx` (2)
- `src/app/(auth)/auth/components/AuthCard.tsx` (2)
- `src/resources/once-ui.config.js` (1)
- `src/components/effects/PrismGlow.tsx` (1)
- `src/app/(landing)/components/Hero.tsx` (1)
- `src/app/(landing)/pricing/components/Plan.tsx` (1)
- `src/app/(landing)/pricing/page.tsx` (1)
- `src/content/blog/post-10.mdx` (1)
- `src/content/blog/post-11.mdx` (1)
- `src/content/blog/post-2.mdx` (1)
- `src/content/blog/post-3.mdx` (1)
- `src/content/blog/post-7.mdx` (1)
- `src/content/blog/post-8.mdx` (1)
- `src/content/blog/post-9.mdx` (1)
- `src/content/legal/privacy-policy.mdx` (1)
- `src/content/legal/terms-of-use.mdx` (1)
- `src/app/(product)/app/[org]/users/components/TableClient.tsx` (1)
- `src/app/(product)/components/Header.tsx` (1)
- `src/lib/billing/status.ts` (1)
- `README.md` (1)

Search: `convert\.once-ui\.com|magic-convert|once-ui-system\/stack|Once UI|Lorant|\/trademarks\/|once-ui\.com\/pricing`. Logos and demo images live in `public/`.

## Checking your work

`npm run typecheck`, then `npm run build` (needs no environment variables: the app runs in demo mode), then `npm start` and request the pages.
