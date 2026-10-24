# Acme Notes: notes for coding agents

Read this before the tree: it says where everything lives, so you can go straight to the files a task needs.
Built with Next.js App Router and `@once-ui-system/core`; composition in `stack.json`.

## Map

### Shell
- **Brand, theme, fonts:** `src/resources/once-ui.config.js`: `baseURL`, `fonts`, `style` (brand, accent, neutral, theme mode), and `schema` (name, tagline, logo).
- **SEO:** `src/resources/seo.js` exports one object per page (title, description, path, image). Pages pass them to `pageMetadata()` in `src/lib/meta.ts`.
- **Root layout and providers:** `src/app/layout.tsx`, `src/components/Providers.tsx`. MDX rendering: `src/components/Mdx.tsx`.
- **Copy:** `src/content/landing.ts` (hero, features, plans), `src/content/legal.ts` (privacy and terms).

### Landing and blog
- Routes: `/` (`src/app/(landing)/page.tsx`), `/blog`, `/blog/[slug]`, `/privacy`, `/terms`. The landing layout (`src/app/(landing)/layout.tsx`) wraps them in `SiteHeader` and `SiteFooter`.
- Blog posts are MDX files in `src/content/blog/` (frontmatter: title, summary, publishedAt). `src/lib/blog.ts` reads and sorts them.

### Auth (Supabase)
- Pages in `src/app/(auth)/`: `/auth` (sign in, sign up, forgot password), `/auth/callback` (exchanges the email link's code), `/auth/update-password`, `/invite/[token]`.
- Clients: `src/lib/supabase/browser.ts` (forms), `src/lib/supabase/server.ts` (per-request session, and the service-role client, which every org check must precede).
- `src/proxy.ts` refreshes the session and sends signed-out visitors of `/app`, `/profile` and `/invite` to `/auth`. `isSupabaseConfigured()` in `src/lib/env.ts` switches demo mode (no env vars: nothing gated).

### Organizations
- Signed-in shell: `src/app/(product)/layout.tsx` renders `src/components/app/AppShell.tsx` (header with org switcher and account menu, sidebar, mobile drawer).
- Pages under `src/app/(product)/app/[org]/`: dashboard, `members`, `settings`. Every page goes through `checkOrgAccessOrDemo()` in `src/lib/orgs/guard.ts`, which answers 404 to non-members and 403 below the required role.
- Roles, plan limits and the demo organization: `src/lib/orgs/types.ts`. Token and slug helpers: `src/lib/orgs/slug.ts`. Listing memberships: `src/lib/orgs/queries.ts`.
- JSON API in `src/app/api/`: `orgs` (create), `orgs/[org]` (read, rename), `orgs/[org]/members`, `orgs/[org]/invitations`, `orgs/[org]/billing/checkout`, `invitations/[token]` (accept), `webhooks/stripe`. Shared helpers: `src/lib/api.ts`.
- Stripe: REST calls and webhook signature check in `src/lib/stripe.ts`; `STRIPE_API_BASE` redirects them.
- Schema: `supabase/migrations/` (applied in filename order; RLS on every table).

## Checking your work

`npm run typecheck` (or `npx tsc --noEmit`), `npm run lint`, then `npm run build` (needs no environment variables: the app runs in demo mode), then `npm start` and request the pages.

# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
