# Acme Notes

Notes your whole team can find. A Next.js (App Router) app with Once UI: a landing page, a blog, sign-in with Supabase, and organizations with members, invitations and a Team plan through Stripe. See AGENTS.md for where everything lives and SPEC.md for what it delivers.

```bash
npm install
npm run dev
```

Everything builds and runs with no environment variables (demo mode). `.env.example` lists the Supabase and Stripe variables. Apply the SQL in `supabase/migrations/` in filename order to a fresh Supabase project.

```bash
npm run typecheck
npm run build
```
