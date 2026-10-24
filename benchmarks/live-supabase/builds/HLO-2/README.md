# Acme Notes

A notes app for teams, built with Next.js (App Router) and Once UI.

## Run it

```bash
npm install
npm run build
npx next start -p 3000
```

With no environment variables the app runs in demo mode: sign-in is off and the
workspace shows sample data. To run live, copy `.env.example` to `.env.local`,
fill in the Supabase and Stripe values, apply `supabase/migrations/` to the
Supabase project in filename order, then start the app.

## Layout

- `src/resources/once-ui.config.ts`: brand, theme and SEO defaults.
- `src/app/(site)/`: landing page, blog, privacy and terms.
- `content/blog/`: MDX posts, one file per post.
- `src/app/(auth)/`: sign in, sign up, password reset, invitation acceptance.
- `src/app/app/`: the signed-in app, organization by organization.
- `src/app/api/`: the JSON API and the Stripe webhook.
- `src/proxy.ts`: refreshes the session and keeps signed-out visitors out of `/app`.
