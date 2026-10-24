# Acme Notes

Acme Notes is a notes app for teams: a landing page, a blog, sign-in with Supabase, organizations with owner, admin and member roles, and Team billing through Stripe. See `SPEC.md` for what it delivers and `AGENTS.md` for where everything lives.

```bash
npm install
npm run dev
```

With no environment variables the app runs in demo mode (sample data, no sign-in). See `.env.example` for the Supabase and Stripe variables and `supabase/migrations/` for the schema, applied in filename order.

```bash
npm run typecheck
npm run lint
npm run build
```
