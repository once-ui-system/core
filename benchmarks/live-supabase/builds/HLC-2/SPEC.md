# Acme Notes: what to deliver

Acme Notes is a notes app for teams. Deliver it as a Next.js (App Router) app built with Tailwind CSS and shadcn/ui (already set up, every component installed under `src/components/ui`), in the directory you were given.

## 1. Brand and customization
- Product name **Acme Notes**, tagline **"Notes your whole team can find."**, canonical URL `https://acme-notes.example`.
- Theme: brand (primary) color emerald, accent cyan, neutral gray, dark mode by default.
- One config file holds the brand name, the theme settings and the SEO defaults; pages read from it.
- Every page has a title and description; the landing page and blog posts have Open Graph metadata.
- No visible text, link or metadata may name any other product or company (template names, demo copy, sample people, logos).

## 2. Landing page (`/`)
- Hero with the name, the tagline and a "Get started" button to `/auth`.
- Three features: "Shared notebooks", "Instant search", "Roles and permissions".
- Pricing with two plans: Free ($0, up to 3 members) and Team ($8 per member per month).
- Header with links to Blog and Sign in; footer with links to Blog, Privacy (`/privacy`) and Terms (`/terms`). Privacy and terms pages exist (a short paragraph each is enough).

## 3. Blog
- `/blog` lists the MDX posts in a content folder, newest first; `/blog/[slug]` renders one, statically generated.
- The blog contains exactly one post: slug `introducing-acme-notes`, title "Introducing Acme Notes", dated 2026-10-01, a one-line summary and two short paragraphs.

## 4. Authentication (Supabase)
- Email and password via Supabase with `@supabase/ssr`: sign up, sign in, sign out, forgot password and set a new password. Sign-in lives at `/auth`.
- Session handled server-side; everything under `/app` redirects to `/auth` when signed out.

## 5. Organizations (multi-tenant)
- A signed-in user can create organizations and switch between them. Roles: owner, admin, member.
- Members list per organization. Admins and owners invite people by link (random token, expires after 7 days); an accept page joins the invited user to the organization.
- SQL under `supabase/migrations/` creates the tables (see section 8). Every org-scoped API route or server action checks membership and role on the server; one tenant must never read another tenant's data.

## 6. Signed-in app layout
- Org-scoped routes live under `/app/[org]` with a sidebar (Dashboard, Members, Settings) and a header with an org switcher and a user menu (Profile, Sign out). The sidebar collapses on mobile.
- Dashboard: four stat cards. Members: the members list plus invite. Settings: rename the organization (admins and owners only).
- `/app` sends the user to their first organization.

## 7. Runs without configuration
- With no environment variables set, the app is in demo mode: the build passes, every page renders, auth gating is off and a small notice says Supabase is not configured. With the Supabase variables set, everything above is live.
- An `.env.example` lists the variables, including section 8's.

## 8. Live services: Supabase and Stripe
With these variables set, the app runs against a real Supabase project and Stripe (test mode):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_TEAM` (the Team plan's price id) and, optional, `STRIPE_API_BASE`: when it is set (for example `http://localhost:12111`), every Stripe API call goes there instead of `https://api.stripe.com`.

- **Database:** every SQL file lives in `supabase/migrations/`, and the files apply in filename order to a fresh Supabase project (psql as the `postgres` user, stopping at the first error). Row level security is on for every table in the `public` schema.
- **Plans:** each organization has a plan, `free` or `team`, and starts on `free`. Owners and admins upgrade from the app (Settings or a Billing page): this creates a Stripe Checkout session in subscription mode for `STRIPE_PRICE_TEAM`, with the organization's id as the session's `client_reference_id`.
- **Webhook:** `POST /api/webhooks/stripe` verifies the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET` and answers 400 to anything that fails. On `checkout.session.completed` it sets the plan of the organization in `client_reference_id` to `team`.
- **JSON API.** These routes exist; the app's own pages may call them. They read the Supabase session from the cookie `@supabase/ssr` sets, answer 401 when signed out, and 403 or 404 for an organization the user is not a member of. `{org}` is the `slug` that creating the organization returned.
  - `POST /api/orgs` with `{ "name": "…" }` → 201 `{ "id", "slug", "name" }`; the creator is its owner.
  - `GET /api/orgs/{org}` → 200 `{ "id", "slug", "name", "plan", "role" }` (`role` is the caller's).
  - `GET /api/orgs/{org}/members` → 200, an array of `{ "user_id", "email", "role" }`.
  - `POST /api/orgs/{org}/invitations` with `{ "email"?: "…", "role": "member" | "admin" }` → 201 `{ "token", "url" }`; owners and admins only (403 for members).
  - `POST /api/invitations/{token}` → 200; the signed-in user joins with the invitation's role.
  - `POST /api/orgs/{org}/billing/checkout` → 200 `{ "url" }`, the Checkout session's URL; owners and admins only.

## Done means
1. `npx tsc --noEmit` passes.
2. `npx next build` passes with no environment variables set.
3. With `npx next start`, these return HTTP 200 and render the content above: `/`, `/blog`, `/blog/introducing-acme-notes`, `/auth`, `/privacy`, `/terms`, and in demo mode `/app` (following redirects) shows the signed-in layout.
4. Section 8 is checked later against a real local Supabase (`supabase start`, your migrations applied) and stripe-mock, with Stripe-signed webhook events. Neither is reachable from where you build, so you can't run those checks: follow section 8 exactly.
