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

### Landing & blog
- Landing: `src/app/(landing)/page.tsx` (Hero, Features, Pricing), copy in `src/content/landing.ts`; menus in `src/content/misc/navigation.ts`. Blog: MDX in `src/content/blog/`. Legal: `src/content/legal/`, routes `/privacy`, `/terms`.

### Product, orgs and billing
- Shell: `src/app/(product)/` (Sidebar, Header); pages `src/app/(product)/app/[org]/` (dashboard, `members`, `settings`). Supabase clients in `src/lib/sb/`, demo mode via `isSupabaseConfigured()`.
- Orgs: guards in `src/lib/orgs/server.ts`, invitations in `src/lib/orgs/invitations.ts`; API under `src/app/api/orgs/` and `src/app/api/invitations/`. Plan lives in `organizations.plan`.
- Billing: checkout `src/app/api/orgs/[org]/billing/checkout`, webhook `src/app/api/webhooks/stripe`, Stripe calls in `src/lib/billing/` (`STRIPE_API_BASE` overrides the host).
- SQL: `supabase/migrations/`, applied in filename order.

## Checking your work

`npm run typecheck`, then `npm run build` (needs no environment variables: the app runs in demo mode), then `npm start` and request the pages.
