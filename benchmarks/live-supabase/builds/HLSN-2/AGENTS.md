# Acme Notes: notes for coding agents

Read this before the tree: it says where everything lives, so you can go straight to the files a task needs.
Built with Next.js App Router and `@once-ui-system/core`. Runs in demo mode with no environment; section 8 of SPEC.md lists the live Supabase and Stripe variables.

## Map

### Shell
- **Brand, theme, schema:** `src/resources/once-ui.config.js`: `baseURL`, `style` (brand emerald, accent cyan, neutral gray, dark by default), `dataStyle`, `schema` (product name, tagline, email).
- **SEO:** `src/resources/seo.js` exports one object per page (title, description, path, robots, canonical); pages pass them to `Meta.generate`.
- **Root layout and providers:** `src/app/layout.tsx`, `src/components/Providers.tsx`, `src/components/OrgProvider.tsx` (the organization list and the switcher). MDX rendering: `src/components/Mdx.tsx`. Icons: `src/resources/icons.ts`.
- **Copy:** landing copy in `src/content/landing.ts`; blog posts are MDX files in `src/content/posts/` (frontmatter: title, summary, publishedAt as a quoted date). `src/lib/content.ts` reads them.

### Landing
- `src/app/(landing)/`: `/` (Hero, Features, Pricing in `components/`), `/blog` and `/blog/[slug]` (statically generated), `/privacy`, `/terms`. Header links Blog and Sign in; footer links Blog, Privacy and Terms.

### Auth
- `src/app/(auth)/auth/`: sign in, sign up and forgot password at `/auth` (`?state=signup|forgot-password`), and `/auth/update-password`. Supabase clients in `src/lib/sb/`. `isSupabaseConfigured()` in `src/lib/sb/config.ts` switches demo mode. Route gating for `/app` and `/profile` is `src/lib/sb/middleware.ts`, run from `src/proxy.ts`.

### Organizations (multi-tenant)
- **Guards:** `src/lib/orgs/server.ts`. Every org-scoped route and page goes through `requireOrg`, `requireOrgAdmin` or `requireOrgOwner`, then filters on the admitted organization's id. RLS is on with no policies; the service-role client bypasses it.
- **Types, slugs, tokens:** `src/lib/orgs/types.ts`, `slug.ts`, `token.ts`. Invitations: `src/lib/orgs/invitations.ts`.
- **JSON API:** `src/app/api/orgs/` (list and create, `[org]` read and rename, `[org]/members`, `[org]/invitations`, `[org]/billing/checkout`), `src/app/api/invitations/[token]`.
- **Pages:** `src/app/(product)/app/[org]/`: Dashboard (`page.tsx`), `members/`, `settings/`. The shell is `src/app/(product)/layout.tsx` with `components/Header.tsx` and `components/Sidebar.tsx`. `/invite/[token]` is in `src/app/(orgs)/`.
- **Schema:** `supabase/migrations/` (`0001_orgs.sql`, `0002_billing.sql`), applied in filename order.

### Billing (Stripe)
- `src/lib/billing/server.ts`: the Team checkout (subscription mode, `client_reference_id` = organization id) and `setOrganizationPlan`. `src/lib/billing/stripe.ts`: the REST calls (`STRIPE_API_BASE` overrides the host). `src/lib/billing/signature.ts`: webhook signature checks.
- Webhook: `src/app/api/webhooks/stripe/route.ts`. On `checkout.session.completed` the organization moves to `team`.

## Stale scaffold files

Files from the earlier scaffold that nothing imports are listed in `tsconfig.json`'s `exclude`. The old route folders (`(landing)/about`, `contact`, `pricing`, `privacy-policy`, `terms-of-use`, and `(product)/app/[org]/analytics`, `billing`, `users`) and `/api/profile` now answer 404. The unused scaffold files (`src/content/misc`, `src/content/about`, `src/content/legal`, `src/content/blog/post-1.mdx`, `scripts/`, `supabase/*.sql` outside `migrations/`, the old images) can be deleted along with them.

## Checking your work

`npm run typecheck`, then `npm run build` (no environment variables needed: the app runs in demo mode), then `npm start` and request the pages.
